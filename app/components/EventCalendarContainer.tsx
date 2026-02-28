import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import { Ellipsis } from "lucide-react";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = await searchParams;
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Ellipsis className="cursor-pointer" />
      </div>
      <div className="flex flex-col gap-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;