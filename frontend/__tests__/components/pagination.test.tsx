import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "@/components/Pagination"; // adjust path as needed

describe("Pagination", () => {
  let onPageChange: jest.Mock;

  beforeEach(() => {
    onPageChange = jest.fn();
  });

  it("renders all pages when totalPages ≤ 5", () => {
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />
    );
    // should render buttons 1,2,3
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    // no dots
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("shows right dots only when near start", () => {
    render(
      <Pagination currentPage={2} totalPages={10} onPageChange={onPageChange} />
    );
    // pages: 1,2,3,...,10
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("shows left dots only when near end", () => {
    render(
      <Pagination currentPage={9} totalPages={10} onPageChange={onPageChange} />
    );
    // pages: 1,...,8,9,10
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "9" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("shows both dots when in middle", () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />
    );
    // pages: 1,...,4,5,6,...,10
    const dots = screen.getAllByText("...");
    expect(dots).toHaveLength(2);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("calls onPageChange when page buttons are clicked", async () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it("disables First & Prev on first page", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );
    expect(screen.getByRole("button", { name: /first page/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /previous page/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /next page/i })
    ).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: /last page/i })
    ).not.toBeDisabled();
  });

  it("disables Next & Last on last page", () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />
    );
    expect(
      screen.getByRole("button", { name: /first page/i })
    ).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: /previous page/i })
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /last page/i })).toBeDisabled();
  });
});
