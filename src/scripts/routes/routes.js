import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from "../utils/auth";
import HomePage from "../pages/home/home-page"
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import NotFoundPage from "../pages/not-found/not-found-page";

export const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/add-story': () => checkAuthenticatedRoute(new AddStoryPage()),

  // Not Found page as fallback for unrecognized routes
  '*': () => new NotFoundPage(),
};
