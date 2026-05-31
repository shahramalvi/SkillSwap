import toast from "react-hot-toast";
import { ComplaintBot } from "../components/features/help/ComplaintBot";
import { ComplaintsList } from "../components/features/help/ComplaintsList";
import { DemoDataBanner } from "../components/features/DemoDataBanner";
import {
  AppAsidePanel,
  AppPage,
  AppPageSplit,
  AppStatRow,
} from "../components/layout/AppPage";
import { useComplaints } from "../hooks/useComplaints";

export function HelpCenter() {
  const { loading, pending, resolved, createComplaint, isDemo } = useComplaints();

  const handleSubmit = async (input: Parameters<typeof createComplaint>[0]) => {
    const ticketId = await createComplaint(input);
    toast.success("Complaint registered");
    return ticketId;
  };

  return (
    <AppPage>
      {isDemo && (
        <DemoDataBanner message="Sample resolved complaints shown — file a real complaint with the bot below." />
      )}

      <div>
        <p className="text-sm text-muted max-w-3xl">
          Get support, file a complaint, and track its status. The complaint bot will walk you
          through a few questions and register your ticket.
        </p>
      </div>

      <AppPageSplit
        asidePosition="left"
        aside={
          <>
            <ComplaintsList pending={pending} resolved={resolved} loading={loading} />
            <AppAsidePanel title="Response time">
              <p className="text-sm text-muted leading-relaxed">
                Pending complaints are reviewed within 2–3 business days. You&apos;ll see status
                updates here when resolved.
              </p>
            </AppAsidePanel>
            <AppAsidePanel title="Summary">
              <AppStatRow label="Pending" value={pending.length} highlight={pending.length > 0} />
              <AppStatRow label="Resolved" value={resolved.length} />
            </AppAsidePanel>
          </>
        }
        main={<ComplaintBot onSubmit={handleSubmit} />}
      />
    </AppPage>
  );
}
