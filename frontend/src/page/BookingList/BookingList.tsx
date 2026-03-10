import Pagination from "@/components/ui/pagination";
import { Badge, Box, Button, Flex, HStack, Table, Text } from "@chakra-ui/react";
import { useFrappeAuth, useFrappeGetDocList } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../component/loader/Loader";
import Title from "../../component/title/Title";
import { URL_LOGIN, URL_NEW_MEETING_BOOKING } from "../../router/router-link";

type BookingItem = {
  name: string;
  title: string;
  docstatus: number;
  meeting_room: string;
  start_time: string;
  start_date: string;
  creation: string;
  _comment_count: number;
};

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "red" },
  1: { label: "Submitted", color: "blue" },
  2: { label: "Cancelled", color: "gray" },
};

// function timeAgo(creation: string): string {
//   const now = new Date();
//   const created = new Date(creation);
//   const diffMs = now.getTime() - created.getTime();
//   const diffMins = Math.floor(diffMs / 60000);
//   if (diffMins < 1) return "just now";
//   if (diffMins < 60) return `${diffMins} m`;
//   const diffHours = Math.floor(diffMins / 60);
//   if (diffHours < 24) return `${diffHours} h`;
//   const diffDays = Math.floor(diffHours / 24);
//   if (diffDays < 30) return `${diffDays} d`;
//   const diffMonths = Math.floor(diffDays / 30);
//   return `${diffMonths} mo`;
// }

function truncateId(name: string): string {
  if (name.length > 14) return name.substring(0, 14) + "...";
  return name;
}

const BookingList = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useFrappeAuth();
  //   const [liked, setLiked] = useState<Set<string>>(new Set());
  //   const [selected, setSelected] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Get Current List Doc Count for pagination
  const { data: docCount } = useFrappeGetDocList("Meeting Room Booking", {
    fields: ["count(name)"],
    filters: [["docstatus", "!=", "2"]],
  });
  const count = docCount?.[0]?.["count(name)"] ?? 0;

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate(URL_LOGIN());
    }
  }, [currentUser, authLoading, navigate]);

  const {
    data: bookings,
    isLoading,
    error,
  } = useFrappeGetDocList<BookingItem>("Meeting Room Booking", {
    fields: ["name", "title", "docstatus", "meeting_room", "start_time", "start_date"],
    // fields: ["name", "title", "docstatus", "meeting_room", "start_time", "start_date", "creation", "_comment_count"],
    orderBy: { field: "creation", order: "desc" },
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
  });

  //   const toggleLike = (name: string) => {
  //     setLiked((prev) => {
  //       const next = new Set(prev);
  //       if (next.has(name)) next.delete(name);
  //       else next.add(name);
  //       return next;
  //     });
  //   };

  //   const toggleSelect = (name: string) => {
  //     setSelected((prev) => {
  //       const next = new Set(prev);
  //       if (next.has(name)) next.delete(name);
  //       else next.add(name);
  //       return next;
  //     });
  //   };

  //   const allSelected = useMemo(
  //     () => !!bookings?.length && selected.size === bookings.length,
  //     [bookings, selected]
  //   );

  //   const toggleAll = () => {
  //     if (!bookings) return;
  //     if (allSelected) {
  //       setSelected(new Set());
  //     } else {
  //       setSelected(new Set(bookings.map((b) => b.name)));
  //     }
  //   };

  if (authLoading || isLoading) return <Loader variant="page" />;

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.300">Error loading bookings: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Title size="2xl" color="white" weight="semibold">
          Meeting Bookings
        </Title>
        <Link to={URL_NEW_MEETING_BOOKING()}>
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="whiteAlpha.400"
            _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
          >
            <FaPlus /> New Booking
          </Button>
        </Link>
      </Flex>

      <div className=" my-2 border border-gray-400 max-w-[1820px] mx-auto rounded-lg overflow-hidden shadow-lg backdrop-blur-md bg-white bg-opacity-10  text-white">
        <Table.Root size="lg" variant="line" showColumnBorder={false}>
          <Table.Header>
            <Table.Row bg="transparent">
              {/* <Table.ColumnHeader w="40px" ps={3}>
                <ChakraCheckbox.Root
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  size="sm"
                >
                  <ChakraCheckbox.HiddenInput />
                  <ChakraCheckbox.Control />
                </ChakraCheckbox.Root>
              </Table.ColumnHeader> */}
              {/* <Table.ColumnHeader w="40px" /> */}
              <Table.ColumnHeader
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
                ps={6}
                color="gray.200"
              >
                Meeting Title
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="gray.200"
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Meeting Room
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="gray.200"
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Time
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="gray.200"
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Date
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="gray.200"
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                ID
              </Table.ColumnHeader>
              <Table.ColumnHeader
                color="gray.200"
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Status
              </Table.ColumnHeader>
              {/* <Table.ColumnHeader w="30px" /> */}
              {/* <Table.ColumnHeader color="gray.200" fontWeight="semibold" fontSize="xs" textAlign="end" pe={6}>
                {bookings?.length ? `${bookings.length} of ${bookings.length}` : ""}
              </Table.ColumnHeader> */}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {bookings?.map((booking) => {
              const status = statusMap[booking.docstatus] ?? statusMap[0];
              return (
                <Table.Row
                  key={booking.name}
                  _hover={{ bg: "white/10" }}
                  bg={"transparent"}
                  color={"white"}
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  {/* <Table.Cell ps={3}>
                    <ChakraCheckbox.Root
                      checked={selected.has(booking.name)}
                      onCheckedChange={() => toggleSelect(booking.name)}
                      size="sm"
                    >
                      <ChakraCheckbox.HiddenInput />
                      <ChakraCheckbox.Control />
                    </ChakraCheckbox.Root>
                  </Table.Cell> */}
                  {/* <Table.Cell>
                    <IconButton
                      aria-label="Like"
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(booking.name);
                      }}
                    >
                      <Icon
                        color={liked.has(booking.name) ? "red.500" : "gray.300"}
                      >
                        {liked.has(booking.name) ? <FaHeart /> : <FaRegHeart />}
                      </Icon>
                    </IconButton>
                  </Table.Cell> */}
                  <Table.Cell ps={6} fontWeight="medium" color="white">
                    {booking.title}
                  </Table.Cell>
                  <Table.Cell color={"white"}>{booking.meeting_room}</Table.Cell>
                  <Table.Cell color={"white"}>{booking.start_time}</Table.Cell>
                  <Table.Cell color={"white"}>{booking.start_date}</Table.Cell>
                  <Table.Cell color={"white"} fontFamily="mono" fontSize="sm">
                    {truncateId(booking.name)}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={1.5}>
                      <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg={
                          status.color === "blue"
                            ? "blue.500"
                            : status.color === "red"
                              ? "red.400"
                              : "gray.400"
                        }
                      />
                      <Badge
                        variant="subtle"
                        colorPalette={status.color}
                        fontSize="xs"
                        px={2.5}
                        py={0.5}
                        borderRadius="full"
                        textTransform="capitalize"
                      >
                        {status.label}
                      </Badge>
                    </HStack>
                  </Table.Cell>
                  {/* <Table.Cell pe={6} /> */}
                  {/* <Table.Cell>
                    <Text color="gray.400" fontSize="sm">-</Text>
                  </Table.Cell> */}
                  {/* <Table.Cell>
                    <HStack gap={3} justify="flex-end">
                      <Text color="gray.400" fontSize="xs">
                        {timeAgo(booking.creation)}
                      </Text>
                      <HStack gap={1}>
                        <Icon color="gray.400" fontSize="xs">
                          <FaRegComment />
                        </Icon>
                        <Text color="gray.400" fontSize="xs">
                          {booking._comment_count ?? 0}
                        </Text>
                      </HStack>
                    </HStack>
                  </Table.Cell> */}
                </Table.Row>
              );
            })}
            {(!bookings || bookings.length === 0) && (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <Flex justify="center" align="center" py={12} direction="column" gap={2}>
                    <Text color="gray.400" fontSize="lg" fontWeight="medium">
                      No bookings found
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      Create a new booking to get started
                    </Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
      <div className="flex justify-end py-4">
        <Pagination
          count={count}
          pageSize={pageSize}
          page={page}
          onPageChange={({ page }) => setPage(page)}
        />
      </div>
    </Box>
  );
};

export default BookingList;
