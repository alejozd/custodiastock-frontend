import { useCallback, useEffect, useRef, useState } from "react";
import { FilterMatchMode } from "primereact/api";
import { useAuth } from "../context/AuthContext";

/**
 * Shared state/effects for the auditable list pages (Entries, Deliveries):
 * date-range quick filters, the global text filter, the view/cancel dialog
 * flow, and stale-response protection for the list fetch.
 *
 * Design notes:
 * - `fetchList`/`cancelItem` are kept in refs so callers don't need to
 *   memoize them with useCallback; only startDate/endDate changes re-trigger
 *   the load effect.
 * - `setQuickRange` only updates startDate/endDate/activeRange. It must NOT
 *   also call load() manually: the effect below already reacts to
 *   startDate/endDate changes. Previously (in Entries.jsx/Deliveries.jsx)
 *   setQuickRange followed the state updates with
 *   `setTimeout(() => loadEntries(), 10)`, whose closure captured the range
 *   *before* the setState calls applied. That produced a duplicate request
 *   for the stale range in addition to the fresh one fired by the effect;
 *   if the stale request resolved after the fresh one, it silently
 *   overwrote the table with the wrong date range (a real, click-fast race
 *   condition). Removing the manual call and relying solely on the
 *   startDate/endDate effect eliminates the duplicate request entirely.
 * - As defense in depth against any other source of out-of-order
 *   responses, `load` also tags each request with an incrementing id and
 *   only the most recent one is allowed to write into state.
 *
 * @param {Object} options
 * @param {(params: { startDate?: string, endDate?: string }) => Promise<any[]>} options.fetchList
 *   Loads the list for the given date-range params (already ISO strings).
 * @param {(id: number|string, payload: { reason: string }) => Promise<any>} options.cancelItem
 *   Cancels/annuls the selected item.
 * @param {(error: Error) => string} [options.getLoadErrorMessage]
 *   Builds the toast detail shown when the list fetch fails.
 * @param {string} [options.cancelReasonRequiredMessage]
 *   Toast detail shown when submitCancel is called without a reason.
 * @param {string} [options.cancelSuccessSummary]
 *   Toast summary shown after a successful cancel.
 * @param {(item: any) => string} [options.getCancelSuccessDetail]
 *   Toast detail shown after a successful cancel.
 * @param {string} [options.cancelErrorFallback]
 *   Toast detail shown when the cancel request fails without a server message.
 */
export function useAuditableListPage({
  fetchList,
  cancelItem,
  getLoadErrorMessage = (error) => `No se pudieron cargar los datos, ${error.message}`,
  cancelReasonRequiredMessage = "Debes ingresar un motivo para la anulación.",
  cancelSuccessSummary = "Anulado con éxito",
  getCancelSuccessDetail = (item) => `El registro #${item?.id} ha sido anulado con éxito.`,
  cancelErrorFallback = "No se pudo anular el registro.",
}) {
  const { currentUser } = useAuth();
  const toast = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeRange, setActiveRange] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedView, setSelectedView] = useState(null);

  const fetchListRef = useRef(fetchList);
  fetchListRef.current = fetchList;
  const cancelItemRef = useRef(cancelItem);
  cancelItemRef.current = cancelItem;

  // Only the most recently dispatched request may write into state.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const data = await fetchListRef.current(params);

      if (requestId === requestIdRef.current) {
        setItems(data);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: getLoadErrorMessage(error),
        });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    setActiveRange(days);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setGlobalFilterValue("");
    setActiveRange(null);
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      global: { ...prev.global, value },
    }));
    setGlobalFilterValue(value);
  };

  const submitCancel = async () => {
    if (!selectedItem || !currentUser || loading) return;

    if (!cancelReason.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: cancelReasonRequiredMessage,
        life: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      // adminUserId is not sent: the backend derives the acting admin from
      // the authenticated request's token, not from client-supplied data.
      await cancelItemRef.current(selectedItem.id, { reason: cancelReason });

      toast.current?.show({
        severity: "success",
        summary: cancelSuccessSummary,
        detail: getCancelSuccessDetail(selectedItem),
        life: 5000,
      });

      setDialogVisible(false);
      setSelectedItem(null);
      setCancelReason("");
      load();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || cancelErrorFallback,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    toast,
    items,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeRange,
    filters,
    globalFilterValue,
    setQuickRange,
    clearFilters,
    onGlobalFilterChange,
    load,
    dialogVisible,
    setDialogVisible,
    cancelReason,
    setCancelReason,
    selectedItem,
    setSelectedItem,
    viewDialogVisible,
    setViewDialogVisible,
    selectedView,
    setSelectedView,
    submitCancel,
  };
}

export default useAuditableListPage;
