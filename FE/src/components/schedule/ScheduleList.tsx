import ScheduleItem from "./ScheduleItem";
import useScheduleStore from "../../stores/useScheduleStore";

const ScheduleList = () => {
  const scheduleList = useScheduleStore((state) => state.schedules);

  return (
    <div className="">
      <div className="mt-2 p-4 max-h-[33rem] overflow-y-auto">
        {scheduleList.length > 0 ? (
          scheduleList.map((schedule) => (
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
          ))
        ) : (
          <div className="text-center text-gray-500 mt-4">
            환기 일정이 없습니다! 등록해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
