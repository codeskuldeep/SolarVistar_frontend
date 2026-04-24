// VisitQuotationsDrawer.jsx
// Thin adapter — converts visit props to the generic QuotationsDrawer interface.
import QuotationsDrawer from "./QuotationsDrawer";

const VisitQuotationsDrawer = ({ visit, onClose }) => (
  <QuotationsDrawer
    leadId={visit?.leadId}
    title={visit?.customerName}
    subtitle={visit?.address}
    onClose={onClose}
  />
);

export default VisitQuotationsDrawer;
