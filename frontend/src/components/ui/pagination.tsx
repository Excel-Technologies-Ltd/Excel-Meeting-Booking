"use client";

import { ButtonGroup, Pagination as ChPagination, IconButton } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface PaginationProps {
  count: number;
  pageSize: number;
  page: number;
  onPageChange: (details: { page: number }) => void;
}

const Pagination = ({ count, pageSize, page, onPageChange }: PaginationProps) => {
  return (
    <ChPagination.Root count={count} pageSize={pageSize} page={page} onPageChange={onPageChange}>
      <ButtonGroup variant="ghost" size="sm">
        <ChPagination.PrevTrigger asChild>
          <IconButton color={"white"} bg="white/10" _hover={{ bg: "white/30" }}>
            <LuChevronLeft />
          </IconButton>
        </ChPagination.PrevTrigger>

        <ChPagination.Items
          render={(page) => (
            <IconButton
              variant={{ base: "ghost", _selected: "outline" }}
              color={"white"}
              bg="white/10"
              _hover={{ bg: "white/30" }}
            >
              {page.value}
            </IconButton>
          )}
          color={"white"}
        />

        <ChPagination.NextTrigger asChild>
          <IconButton color={"white"} bg="white/10" _hover={{ bg: "white/30" }}>
            <LuChevronRight />
          </IconButton>
        </ChPagination.NextTrigger>
      </ButtonGroup>
    </ChPagination.Root>
  );
};

export default Pagination;
