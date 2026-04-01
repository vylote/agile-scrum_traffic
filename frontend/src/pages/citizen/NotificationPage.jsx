import BottomNavigation from "../../components/BottomNavigation"
import NotificationCard from "../../components/NotificationCard"

export default function NotificationPage() {

  return (
    <div className="p-4 pb-20 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-bold mb-4">
        Thông báo
      </h1>

      <NotificationCard type="coming" />

      <NotificationCard type="done" />

      <BottomNavigation />

    </div>
  )
}