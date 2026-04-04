import React, { useState, useRef, useEffect } from "react";
import Map from "../../components/Public/Map";
import StatusBar from "../../components/RescueTeam/StatusBar";
import UserProfile from "../../components/RescueTeam/UserProfile";
import OverviewCard from "../../components/RescueTeam/OverviewCard";
import TabBar from "../../components/RescueTeam/TabBar";
import RestingStatus from "../../components/RescueTeam/RestingStatus";

export const RescueHome = () => {
  const [appState, setAppState] = useState("normal");
  const [isResting, setIsResting] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(160); // fallback mặc định
  const bottomPanelRef = useRef(null);

  // Đo lại chiều cao bottom panel mỗi khi state thay đổi
  useEffect(() => {
    if (bottomPanelRef.current) {
      const height = bottomPanelRef.current.getBoundingClientRect().height;
      setBottomHeight(height);
    }
  }, [appState, isResting]);

  // Offset = chiều cao bottom panel + margin 16px để nút GPS không bị che
  const dynamicOffset = bottomHeight + 16;

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 z-0">
        <Map bottomOffset={dynamicOffset} rightOffset={16} />
      </div>

      {(appState === "new_incident" || isResting) && (
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity pointer-events-none" />
      )}

      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none h-full">
        <div className="pointer-events-auto">
          <StatusBar />
          <UserProfile
            isResting={isResting}
            onToggleRest={() => setIsResting(!isResting)}
          />
        </div>

        <div
          ref={bottomPanelRef}
          className="mt-auto flex flex-col w-full pointer-events-auto px-4 pb-4"
        >
          {isResting ? (
            <RestingStatus />
          ) : (
            <OverviewCard appState={appState} setAppState={setAppState} />
          )}
          <TabBar />
        </div>
      </div>
    </main>
  );
};
