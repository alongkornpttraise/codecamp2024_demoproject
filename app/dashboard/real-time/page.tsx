"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ExclamationCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  AcademicCapIcon,
  UserIcon,
  CameraIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import useEmblaCarousel from "embla-carousel-react";
// import "embla-carousel-react/embla.css";

import EmblaCarousel from "@/app/ui/carousel/embla-carousel";

// Embla Carousel Constants
import { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = {
  dragFree: true,
  loop: true,
  align: "start",
};

const workersList = `Mr. Alongkorn Sangngam`;

export default function RealTimePage() {
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(3600); // Start with 3600 seconds (1 hour)
  const [slides, setSlides] = useState<string[]>([]);

  // Fetch image paths from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/get-images");
        if (response.ok) {
          const imagePaths = await response.json();
          setSlides(imagePaths);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0)); // Decrease countdown every second
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0)); // Decrease countdown every second
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  // Convert seconds to whole hours
  const hours = Math.floor(countdown / 3600);

  // Format the countdown to show only hours
  const formattedCountdown = `${hours} hour(s)`;

  // If time is null, return null (avoids SSR issues)
  if (!time) {
    return null;
  }

  // API Call to `real-time` endpoint
  const handleOpenCamera = async () => {
    try {
      const response = await fetch("/api/real-time", {
        method: "POST",
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Camera opened successfully:", result);
        alert("Camera opened successfully!");
      } else {
        console.error("Failed to open camera:", result);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      alert("An error occurred while trying to open the camera.");
    }
  };

  return (
    <div className="h-[90vh] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Work Permit No Dropdown & Buttons */}
            <div className="relative flex gap-2 items-center">
              {/* Work Permit Dropdown */}
              <select className="block appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value="WP_001">WP_001</option>
                <option value="WP_002">WP_002</option>
                <option value="WP_003">WP_003</option>
              </select>

              {/* Open Camera Button */}
              <button
                className="px-4 py-2 text-white bg-rose-500 hover:bg-rose-600 rounded-md flex items-center"
                onClick={handleOpenCamera}
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Open Camera
              </button>

              {/* Real Time Snapshot Button */}
              <button
                className="px-4 py-2 text-white bg-lime-500 hover:bg-lime-600 rounded-md flex items-center"
                onClick={() => window.location.reload()}
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Real Time Snapshot
              </button>
            </div>

            {/* Top Right Buttons (Aligned Right) */}
            <div className="flex items-center gap-4">
              {/* Countdown Button */}
              <button
                className="px-4 py-2 text-white bg-yellow-500 rounded-md cursor-not-allowed"
                disabled
              >
                Countdown: {formattedCountdown}
              </button>

              {/* Current Time Button */}
              <button
                className="px-4 py-2 text-white bg-gray-500 rounded-md cursor-not-allowed"
                disabled
              >
                Time: {time.toLocaleTimeString()}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-start mb-8">
            {/* Embla Carousel Section */}
            <div className="w-full h-auto">
              {/* Updated to full width */}
              {/* Use EmblaCarousel component */}
              <EmblaCarousel slides={slides} options={OPTIONS} />
            </div>
          </div>

          {/* Combined Workers Card */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Workers Currently Working */}
                <div className="flex flex-col justify-center items-start">
                  <div className="text-sm text-gray-500">
                    Workers Currently Working
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-6xl font-extrabold text-gray-800 leading-none">
                      1
                    </span>
                    <span className="text-lg text-gray-500">workers</span>
                  </div>
                </div>

                {/* Workers' Name List */}
                <div>
                  <div className="text-sm text-gray-500">
                    Workers' Name List
                  </div>
                  <textarea
                    value={workersList} // Replace with dynamic value
                    readOnly
                    className="block w-full rounded-md border border-gray-200 py-2 pl-2 text-gray-700 bg-gray-100"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mini Dashboard Section */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Helmet Alert */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <ShieldExclamationIcon className="text-yellow-500 h-8 w-8 mr-4" />
              <div>
                <div className="text-sm text-gray-500">Helmet Alert</div>
                <div className="text-3xl font-bold text-gray-800">3</div>
                <div className="text-xs text-gray-500">alerts</div>
              </div>
            </div>

            {/* Gloves Alert */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <AcademicCapIcon className="text-red-500 h-8 w-8 mr-4" />
              <div>
                <div className="text-sm text-gray-500">Gloves Alert</div>
                <div className="text-3xl font-bold text-gray-800">2</div>
                <div className="text-xs text-gray-500">alerts</div>
              </div>
            </div>

            {/* Belt Alert */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <UserIcon className="text-blue-500 h-8 w-8 mr-4" />
              <div>
                <div className="text-sm text-gray-500">Belt Alert</div>
                <div className="text-3xl font-bold text-gray-800">1</div>
                <div className="text-xs text-gray-500">alerts</div>
              </div>
            </div>

            {/* Actual Working Time */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <ClockIcon className="text-green-500 h-8 w-8 mr-4" />
              <div>
                <div className="text-sm text-gray-500">Actual Working Time</div>
                <div className="text-3xl font-bold text-gray-800">120</div>
                <div className="text-xs text-gray-500">minutes</div>
              </div>
            </div>

            {/* Not Safety Alarms */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <ExclamationCircleIcon className="text-red-500 h-8 w-8 mr-4" />
              <div>
                <div className="text-sm text-gray-500">Not Safety Alarms</div>
                <div className="text-3xl font-bold text-gray-800">6</div>
                <div className="text-xs text-gray-500">alarms</div>
              </div>
            </div>

            {/* Restoration Verification */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <CheckCircleIcon className="text-purple-500 h-8 w-8 mr-4" />
              <div>
                <div className="text-sm text-gray-500">
                  Restoration Verification
                </div>
                <div className="text-3xl font-bold text-gray-800">85</div>
                <div className="text-xs text-gray-500">%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button className="rounded-lg bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600">
            Reject
          </button>
          <button className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-medium hover:bg-cyan-600">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
