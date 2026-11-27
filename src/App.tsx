import { useEffect } from "react";
import { Route } from "react-router-dom";
import {
  IonApp,
  IonContent,
  IonPage,
  IonRouterOutlet,
  createAnimation,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import AppShell from "@/components/layout/app-shell";
import DashboardPage from "@/pages/DashboardPage";
import NotificationsPage from "@/pages/NotificationsPage";
import CreateVisitPage from "@/pages/CreateVisitPage";
import VisitDetailPage from "@/pages/VisitDetailPage";
import EditVisitPage from "@/pages/EditVisitPage";
import ProfilePage from "@/pages/ProfilePage";
import AccountInfoPage from "@/pages/AccountInfoPage";
import {
  bindAutoUpdateOnResume,
  enforceLatestBuildCache,
} from "@/lib/cache-buster";

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
  swipeBackEnabled: true,
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

function CreateVisitRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <CreateVisitPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

function VisitDetailRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <VisitDetailPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

function EditVisitRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <EditVisitPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

function ProfileRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <ProfilePage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

function AccountInfoRoute() {
  return (
    <IonPage>
      <IonContent fullscreen scrollEvents={true}>
        <AppShell>
          <AccountInfoPage />
        </AppShell>
      </IonContent>
    </IonPage>
  );
}

export default function App() {
  useEffect(() => {
    enforceLatestBuildCache().catch(() => {});
    return bindAutoUpdateOnResume();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet animated={true}>
          <Route exact path="/" component={DashboardRoute} />
          <Route exact path="/dashboard" component={DashboardRoute} />
          <Route exact path="/notifications" component={NotificationsRoute} />
          <Route exact path="/visits" component={CreateVisitRoute} />
          <Route exact path="/visits/new" component={CreateVisitRoute} />
          <Route
            exact
            path="/visits/detail/:visitNumber"
            component={VisitDetailRoute}
          />
          <Route
            exact
            path="/visits/edit/:visitNumber"
            component={EditVisitRoute}
          />
          <Route exact path="/visit-detail" component={VisitDetailRoute} />
          <Route exact path="/profile" component={ProfileRoute} />
          <Route exact path="/profil" component={ProfileRoute} />
          <Route
            exact
            path="/profile/account-info"
            component={AccountInfoRoute}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
