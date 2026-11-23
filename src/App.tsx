import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonPage,
  IonRouterOutlet,
  setupIonicReact,
  useIonRouter,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ArrowLeft, Bell } from "@phosphor-icons/react";

setupIonicReact({
  mode: "ios",
  animated: true,
  swipeBackEnabled: true,
});

function DashboardDemo() {
  const router = useIonRouter();

  return (
    <IonPage>
      <main className="min-h-dvh bg-[#F8F8FA]">
        <header className="flex items-center justify-between bg-[#83051C] px-4 pb-5 pt-[calc(env(safe-area-inset-top)+14px)] text-white">
          <h1 className="font-display text-lg font-bold">MOKU</h1>
          <button
            type="button"
            onClick={() => router.push("/notifications", "forward")}
            className="flex h-10 w-10 items-center justify-center rounded-full active:bg-white/15"
            aria-label="Notifikasi"
          >
            <Bell size={22} weight="bold" />
          </button>
        </header>

        <div className="p-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-display text-base font-bold text-[#171717]">
              Tes Transisi Ionic + Vite
            </p>
            <p className="mt-1 text-sm text-[#5A555F]">
              Klik ikon lonceng di kanan atas, lalu coba kembali pakai tombol
              panah, swipe pinggir layar, dan tombol back bawaan HP.
            </p>
          </div>
        </div>
      </main>
    </IonPage>
  );
}

function NotificationsDemo() {
  const router = useIonRouter();

  return (
    <IonPage>
      <main className="min-h-dvh bg-[#F8F8FA]">
        <header className="flex items-center gap-3 bg-[#83051C] px-4 pb-5 pt-[calc(env(safe-area-inset-top)+14px)] text-white">
          <button
            type="button"
            onClick={() => router.goBack()}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/15"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} weight="bold" />
          </button>
          <h1 className="font-display text-lg font-bold">Notifikasi</h1>
        </header>

        <div className="space-y-3 p-4">
          <div className="rounded-2xl bg-[#FBECEF] p-4">
            <p className="font-display text-sm font-bold text-[#171717]">
              Kunjungan Selesai Dicatat
            </p>
            <p className="mt-1 text-xs text-[#3F3A42]">
              Preventive Maintenance unit telah berhasil dicatat.
            </p>
          </div>
        </div>
      </main>
    </IonPage>
  );
}

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={DashboardDemo} />
          <Route exact path="/notifications" component={NotificationsDemo} />
          <Route render={() => <Redirect to="/" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
