import ScheduleItem from "./ScheduleItem";
import useScheduleStore from "../../stores/useScheduleStore";

const ScheduleList = () => {
  const scheduleList = useScheduleStore((state) => state.schedules);
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
            initialEnabled={schedule.activate}
            groupId={schedule.groupId}
            windowsId={schedule.windowsId}
          />
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;
