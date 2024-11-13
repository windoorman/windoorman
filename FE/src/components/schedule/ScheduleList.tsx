import ScheduleItem from "./ScheduleItem";
import useScheduleStore from "../../stores/useScheduleStore";

const ScheduleList = () => {
  const scheduleList = useScheduleStore((state) => state.schedules);
  return (
    <div className="">
      <div className="mt-2 p-4 max-h-[33rem] overflow-y-auto">
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
