import prisma from "@/lib/prisma";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
    const date = dateParam ? new Date(dateParam) : new Date();

    const data = await prisma.event.findMany({
        where: {
            startTime: {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lte: new Date(date.setHours(23, 59, 59, 999)),
            },
        },
    });

    if (data.length === 0) {
        return (
            <div className="text-gray-400 text-sm italic text-center py-6">
                No events for this day
            </div>
        );
    }

    return data.map((event) => (
        <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-blue-300 even:border-t-purple-300"
            key={event.id}
        >
            <div className="flex flex-col gap-1">
                <span className="text-black text-xs inline-flex self-end border-2 rounded-full px-2 py-1">
                    {event.startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, })} - {event.endTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, })}
                </span>
                <h1 className="font-semibold text-gray-600">{event.title}</h1>
                <p className="text-gray-500 text-sm">{event.description}</p>
            </div>
        </div>
    ));
};

export default EventList;