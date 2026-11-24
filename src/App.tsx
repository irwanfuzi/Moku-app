import { Route } from "react-router-dom";
import {
  IonApp,
  IonContent,
  IonPage,
  IonRouterOutlet,
  createAnimation,
  isPlatform,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import AppShell from "@/components/layout/app-shell";
import DashboardPage from "@/pages/DashboardPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotificationDetailPage from "@/pages/NotificationDetailPage";

const seamlessSlideAnimation = (_baseEl: HTMLElement, opts?: any) => {
  const duration = 400;
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  const enteringEl = opts?.enteringEl as HTMLElement | undefined;
  const leavingEl = opts?.leavingEl as HTMLElement | undefined;
  const isBack = opts?.direction === "back";

  const rootAnimation = createAnimation().duration(duration).easing(easing);

  if (enteringEl) {
    const enterAnim = createAnimation()
      .addElement(enteringEl)
      .beforeRemoveClass("ion-page-invisible")
      .fromTo(
        "transform",
        isBack ? "translateX(-100%)" : "translateX(100%)",
        "translateX(0%)"
      );
    rootAnimation.addAnimation(enterAnim);
  }

  if (leavingEl) {
    const leaveAnim = createAnimation()
      .addElement(leavingEl)
      .fromTo(
        "transform",
        "translateX(0%)",
        isBack ? "translateX(100%)" : "translateX(-100%)"
      );
    rootAnimation.addAnimation(leaveAnim);
  }

  return rootAnimation;
};

setupIonicReact({
  mode: "ios",
  animated: true,
  swipeBackEnabled: isPlatform("ios"),
  navAnimation: seamlessSlideAnimation,
});

function DashboardRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <DashboardPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

function NotificationsRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <NotificationsPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

function NotificationDetailRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <NotificationDetailPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet animated={true}>
          <Route exact path="/" component={DashboardRoute} />
          <Route exact path="/dashboard" component={DashboardRoute} />
          <Route exact path="/notifications" component={NotificationsRoute} />
          <Route
            exact
            path="/notifications/:id"
            component={NotificationDetailRoute}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
