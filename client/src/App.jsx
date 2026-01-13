import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/custom/Navbar";
import Footer from "./components/custom/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AllCategoriesViewPage from "./pages/AllCategoriesViewPage";
import BooksViewPage from "./pages/BooksViewPage";
import FurnitureViewPage from "./pages/FurnitureViewPage";
import ClothingViewPage from "./pages/ClothingViewPage";
import MiscellaneousViewPage from "./pages/MiscellaneousViewPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ReviewsPage from "./pages/ReviewsPage";
import BooksForm from "./pages/BooksForm";
import ClothingForm from "./pages/ClothingForm";
import FurnitureForm from "./pages/FurnitureForm";
import MiscellaneousForm from "./pages/MiscellaneousForm";
import NoPageFound from "./pages/NoPageFound";
import { ThemeProvider } from "@/components/context/theme-provider";
import ProtectedRoute from "./components/custom/ProtectedRoute";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationSuccessPage from "./pages/EmailVerificationSuccessPage";
import FavoritesViewPage from "./pages/FavoritesViewPage";
import PostsViewPage from "./pages/PostsViewPage";
import ReportsManagementPage from "./pages/ReportsManagementPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import Privacy from "./pages/Privacy";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/email-verified"
            element={<EmailVerificationSuccessPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/all-categories"
            element={
              <ProtectedRoute>
                <AllCategoriesViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BooksViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/furniture"
            element={
              <ProtectedRoute>
                <FurnitureViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clothing"
            element={
              <ProtectedRoute>
                <ClothingViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/miscellaneous"
            element={
              <ProtectedRoute>
                <MiscellaneousViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <PostsViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/books-form"
            element={
              <ProtectedRoute>
                <BooksForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clothing-form"
            element={
              <ProtectedRoute>
                <ClothingForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/furniture-form"
            element={
              <ProtectedRoute>
                <FurnitureForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/miscellaneous-form"
            element={
              <ProtectedRoute>
                <MiscellaneousForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports-management"
            element={
              <ProtectedRoute adminOnly={true}>
                <ReportsManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <NoPageFound />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </ThemeProvider>
    </Router>
  );
}

export default App;
