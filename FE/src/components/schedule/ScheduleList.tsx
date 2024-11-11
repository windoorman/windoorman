import ScheduleItem from "./ScheduleItem";

const ScheduleList = () => {
  const scheduleList = [
    {
      scheduleId: 1,
      groupId: 1,
      placeName: "본가",
      windowName: "창문1",
      startTime: "11:00:00",
      endTime: "12:00:00",
      days: ["월", "화", "수", "목", "금"],
      isActive: false,
    },
    {
      scheduleId: 2,
      groupId: 3,
      placeName: "본가",
      windowName: "창문2",
      startTime: "13:00:00",
      endTime: "14:00:00",
      days: ["월", "화", "수", "목"],
      isActive: false,
    },
    {
      scheduleId: 3,
      groupId: 5,
      placeName: "자취",
      windowName: "창문3",
      startTime: "15:30:00",
      endTime: "16:00:00",
      days: ["월", "화", "금"],
      isActive: true,
    },
  ];
  return (
    <div>
      <div className="mt-2 p-4">
        {scheduleList.map((schedule) => (
          <ScheduleItem
            key={schedule.scheduleId}
            location={schedule.placeName}
            room={schedule.windowName}
            startTime={schedule.startTime}
            endTime={schedule.endTime}
            days={schedule.days}
            initialEnabled={schedule.isActive}
          />
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;
