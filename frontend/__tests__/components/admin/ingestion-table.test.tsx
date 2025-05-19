/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IngestionTable from "@/components/admin/ingestion-table";
import { ingestionService } from "@/services/ingestion-service";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

// 1) Mock ingestionService methods
jest.mock("@/services/ingestion-service", () => ({
  ingestionService: {
    getIngestionJobs: jest.fn(),
    updateIngestionJobStatus: jest.fn(),
  },
}));

// 2) Stub next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// 3) Stub toast
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

// 4) Stub Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// 5) Stub UI primitives
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ "data-testid": dt }: any) => (
    <div data-testid={dt || "SKELETON"} />
  ),
}));
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, "data-testid": dt }: any) => (
    <span data-testid={dt || "BADGE"}>{children}</span>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, "data-testid": dt }: any) => (
    <div data-testid={dt || "CARD"}>{children}</div>
  ),
}));
jest.mock("@/components/ui/select", () => {
  const Select = ({
    children,
    value,
    onValueChange,
    "data-testid": dt,
  }: any) => (
    <select
      data-testid={dt || "SELECT"}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
  const SelectTrigger = ({ children }: any) => <>{children}</>;
  const SelectValue = () => null;
  const SelectContent = ({ children }: any) => <>{children}</>;
  const SelectItem = ({ value, children }: any) => (
    <option value={value}>{children}</option>
  );
  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/table", () => {
  const Table = ({ children }: any) => <table>{children}</table>;
  const TableHeader = ({ children }: any) => <thead>{children}</thead>;
  const TableBody = ({ children }: any) => <tbody>{children}</tbody>;
  const TableRow = ({ children }: any) => <tr>{children}</tr>;
  const TableHead = ({ children }: any) => <th>{children}</th>;
  const TableCell = ({ children, ...props }: any) => (
    <td {...props}>{children}</td>
  );
  return { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
});
jest.mock("@/components/pagination", () => ({
  __esModule: true,
  default: ({ onPageChange }: any) => (
    <button onClick={() => onPageChange(2)}>Next</button>
  ),
}));

describe("<IngestionTable />", () => {
  const push = jest.fn();
  const toast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (_: string) => null,
      toString: () => "",
    });
    (useToast as jest.Mock).mockReturnValue({ toast });
  });

  it("shows skeletons while loading", () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );
    render(<IngestionTable />);
    expect(screen.getAllByTestId("SKELETON").length).toBeGreaterThan(0);
  });

  it("shows empty state when no jobs", async () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockResolvedValue({
      jobs: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    });
    render(<IngestionTable />);
    expect(
      await screen.findByText(/No ingestion jobs found/i)
    ).toBeInTheDocument();
  });

  it("renders a list of jobs with correct badges and dates", async () => {
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 60_000).toISOString();
    const jobs = [
      {
        _id: "j1",
        documentId: { _id: "d1", title: "Doc 1" },
        status: "pending",
        startedAt: now,
        completedAt: null,
      },
      {
        _id: "j2",
        documentId: "d2",
        status: "completed",
        startedAt: now,
        completedAt: later,
      },
      {
        _id: "j3",
        documentId: "d3",
        status: "failed",
        startedAt: now,
        completedAt: later,
        errorMessage: "Oops",
      },
    ];
    (ingestionService.getIngestionJobs as jest.Mock).mockResolvedValue({
      jobs,
      pagination: { page: 1, limit: 10, total: 3, pages: 1 },
    });
    render(<IngestionTable />);

    // Pending badge
    expect(await screen.findByText("Pending")).toBeInTheDocument();

    // Completed badge: ensure one of the "Completed" nodes is actually our <Badge>
    const completedNodes = await screen.findAllByText("Completed");
    expect(
      completedNodes.some((n) => n.getAttribute("data-testid") === "BADGE")
    ).toBe(true);

    // Failed badge
    const failedNodes = await screen.findAllByText("Failed");
    expect(
      failedNodes.some((n) => n.getAttribute("data-testid") === "BADGE")
    ).toBe(true);

    // Error message
    expect(screen.getByText("Oops")).toBeInTheDocument();

    // Formatted dates
    expect(
      screen.getAllByText(format(new Date(now), "PPp")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(format(new Date(later), "PPp")).length
    ).toBeGreaterThan(0);
  });

  it("changes status filter and resets page", () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockResolvedValue({
      jobs: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    });
    render(<IngestionTable />);

    fireEvent.change(screen.getByTestId("SELECT"), {
      target: { value: "failed" },
    });

    expect(push).toHaveBeenCalled();
    const pushedUrl = (push as jest.Mock).mock.calls[0][0] as string;
    expect(pushedUrl).toContain("status=failed");
    expect(pushedUrl).toContain("page=1");
  });

  it("paginates when there are multiple pages", async () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockResolvedValue({
      jobs: [],
      pagination: { page: 1, limit: 10, total: 20, pages: 2 },
    });
    render(<IngestionTable />);

    fireEvent.click(await screen.findByText("Next"));
    expect(push).toHaveBeenCalledWith(expect.stringContaining("page=2"));
  });

  it("refresh button calls fetchJobs again", async () => {
    const spy = jest.spyOn(ingestionService, "getIngestionJobs");
    spy.mockResolvedValue({
      jobs: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    });
    render(<IngestionTable />);

    await screen.findByText(/No ingestion jobs found/i);
    fireEvent.click(screen.getByText(/Refresh/i));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("updates a failed job → success toast + refetch", async () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockResolvedValue({
      jobs: [
        {
          _id: "j1",
          documentId: "d1",
          status: "failed",
          startedAt: Date.now(),
          completedAt: null,
          errorMessage: "E",
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });
    (ingestionService.updateIngestionJobStatus as jest.Mock).mockResolvedValue(
      {}
    );
    render(<IngestionTable />);

    fireEvent.click(await screen.findByText(/Retry/i));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Status updated",
          description: "Job status updated to pending.",
        })
      )
    );
  });

  it("status update failure → error toast", async () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockResolvedValue({
      jobs: [
        {
          _id: "j1",
          documentId: "d1",
          status: "pending",
          startedAt: Date.now(),
          completedAt: null,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });
    (ingestionService.updateIngestionJobStatus as jest.Mock).mockRejectedValue(
      new Error("X")
    );
    render(<IngestionTable />);

    fireEvent.click(await screen.findByText(/Start Processing/i));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "X",
        })
      )
    );
  });

  it("fetch failure → error toast", async () => {
    (ingestionService.getIngestionJobs as jest.Mock).mockRejectedValue(
      new Error("Boom")
    );
    render(<IngestionTable />);
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error",
          description: "Boom",
        })
      )
    );
  });
});
