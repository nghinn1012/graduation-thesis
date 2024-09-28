import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Meal } from "../../api/post";

interface SetTimeProps {
  meal: Meal;
  date: Date;
  onSubmit: (time: string) => void;
  onClose: () => void;
  time: string;
}

const SetTime: React.FC<SetTimeProps> = ({ meal, date, onSubmit, onClose, time }) => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  useEffect(() => {
    if (time) {
      setStartTime(time);
      updateEndTime(time);
    }
    console.log(time);
  }, [time]);

  const updateEndTime = (startTime: string) => {
    const calculatedEndTime = calculateEndTime(startTime);
    setEndTime(format(calculatedEndTime, "HH:mm"));
  };

  const calculateEndTime = (startTime: string): Date => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes);
    return new Date(startDate.getTime() + Number(meal.timeToTake || "") * 60000);
  };

  const calculateStartTime = (endTime: string): Date => {
    const [hours, minutes] = endTime.split(":").map(Number);
    const endDate = new Date(date);
    endDate.setHours(hours, minutes);
    return new Date(endDate.getTime() - Number(meal.timeToTake || "") * 60000);
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    const calculatedStartTime = calculateStartTime(newEndTime);
    setStartTime(format(calculatedStartTime, "HH:mm"));
  };

  const handleSubmit = () => {
    onSubmit(calculateStartTime(endTime).toISOString());
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Set Meal Time</h2>
          <button className="btn btn-ghost btn-circle" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Choose what time you want to eat and if you'd like a reminder to start your prep.
        </p>

        {/* Time Selection */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-center font-semibold">{date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</h3>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="font-semibold">START</p>
              <p className="text-xl">{startTime}</p>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-4 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">SERVE</p>
              <p className="text-xl">{endTime}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="time"
            className="w-full input input-bordered"
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
          />
        </div>

        <div className="form-control mb-4">
          <label className="label cursor-pointer">
            <span className="label-text">Remind Me</span>
            <input type="checkbox" className="toggle toggle-primary" />
          </label>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary w-full" onClick={handleSubmit}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetTime;
