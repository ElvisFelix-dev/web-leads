import { Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';

import SignIn from './pages/SignIn';
// import SignUp from './pages/SignUp';
import ForgtPassword from './pages/Forgot-Password';
import ResetPassword from './pages/Reset-Password';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import DashboardCorretor from './pages/DashboardCorretor';
import BrokerHotsite from './pages/hotsite/BrokerHotsite';
import BrokerProperties from './pages/hotsite/BrokerProperties';
import PropertyPage from './pages/hotsite/PropertyPage';
import BrokerAbout from './pages/hotsite/BrokerAbout';
import PropertyCreate from './pages/PropertyCreate';
import PropertyEdit from './pages/PropertyEdit';
import CreateLead from './pages/Create-Leads';
import LeadsList from './pages/Lead-List';
import AssignLeads from './pages/AssignLeads'; // nova página
import MyLeads from './pages/MyLeads';
import EditLead from './pages/EditLead';
import Brokers from './pages/Brokers';
import BrokerNew from './pages/BrokerNew';
import BrokerEdit from './pages/BrokerEdit';
import Me from './pages/Me';
import PropertyDetails from './pages/PropertyDetails';
import Landing from './pages/Landing';
import PropertiesMap from './pages/PropertiesMap';
import Pipeline from './pages/Pipeline';
import BrokerDashboard from './pages/BrokerDashboard';
import Visits from './pages/Visits';
import BrokerPipeline from './pages/BrokerPipeline';
import BrokerDetails from './pages/BrokerDetails';
import LeadDetail from './pages/LeadDetail';
import PropertyList from './pages/PropertyList';
import AdminVisit from './pages/AdminVisits';
import VisitDetails from './pages/VisitDetails';
import Home from './pages/site/Home';
import Contact from './pages/site/Contact';
import PropertyCRMDetails from './pages/PropertyCRMDetails';
import AboutUs from './pages/site/AboutUs';
import Properties from './pages/site/Properties';
import Opportunities from './pages/Opportunities';
import OpportunityCreate from './pages/OpportunityCreate';
import OpportunityDetails from './pages/OpportunityDetails';
import OpportunityEdit from './pages/OpportunityEdit';
import Proposals from './pages/Proposals';
import ProposalCreate from './pages/ProposalCreate';
import ProposalDetails from './pages/ProposalDetails';
import ProposalEdit from './pages/ProposalEdit';
import SalesAdmin from './pages/admin/SalesAdmin';
import SaleDetailsAdmin from './pages/admin/SaleDetailsAdmin';
import CommissionApproval from './pages/admin/CommissionApproval';
import PropertyFavorites from './pages/PropertyFavorites';
import WhatsAppQrCode from './pages/WhatsAppQrCode';
import NotFound from './pages/NotFound';
import PublicProposalForm from './pages/PublicProposalForm';

import ChatPage from './pages/ChatPage';
import NotificationCenter from './pages/NotificationCenter';
import LeadFollowUpTemplates from './pages/admin/LeadFollowUpTemplates';

export function App() {
  return (
    <div className="text-black">
      <Routes>
        {/* Páginas SEM sidebar */}
        <Route path="/" element={<SignIn />} />
        {/*<Route path="/sign-up" element={<SignUp />} />*/}
        <Route path="/forgot-password" element={<ForgtPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/broker/:slug" element={<BrokerHotsite />} />
        <Route
          path="/broker/:brokerSlug/imoveis"
          element={<BrokerProperties />}
        />
        <Route
          path="/broker/:brokerSlug/property/:propertySlug"
          element={<PropertyPage />}
        />

        <Route path="/broker/:brokerSlug/sobre" element={<BrokerAbout />} />

        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/favorites" element={<PropertyFavorites />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/imoveis" element={<Properties />} />
        <Route path="/map" element={<PropertiesMap />} />
        <Route
          path="/proposta-publica/:token"
          element={<PublicProposalForm />}
        />

        {/* Páginas COM sidebar (usam Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard-corretor" element={<DashboardCorretor />} />
          <Route path="/create-property" element={<PropertyCreate />} />
          <Route path="/properties/edit/:id" element={<PropertyEdit />} />
          <Route path="/create-lead" element={<CreateLead />} />
          <Route path="/leads-list" element={<LeadsList />} />
          <Route path="/leads/:id/edit" element={<EditLead />} />
          <Route path="/assign-leads" element={<AssignLeads />} />{' '}
          {/* nova rota */}
          <Route path="/my-leads" element={<MyLeads />} />
          <Route path="/brokers" element={<Brokers />} />
          <Route path="/brokers/new" element={<BrokerNew />} />
          <Route path="/broker-edit/:id" element={<BrokerEdit />} />
          <Route path="/broker-dashboard" element={<BrokerDashboard />} />
          <Route path="/me" element={<Me />} />
          <Route path="/my-visits" element={<Visits />} />
          <Route path="/my-pipeline" element={<BrokerPipeline />} />
          <Route path="/broker-details/:id" element={<BrokerDetails />} />
          <Route path="/lead-detail/:id" element={<LeadDetail />} />
          <Route path="/property-list" element={<PropertyList />} />
          <Route path="/visits" element={<AdminVisit />} />
          <Route path="/visit-details/:id" element={<VisitDetails />} />
          <Route
            path="/propertycrm-details/:id"
            element={<PropertyCRMDetails />}
          />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/new" element={<OpportunityCreate />} />
          <Route path="/opportunities/:id" element={<OpportunityDetails />} />
          <Route path="/opportunities/:id/edit" element={<OpportunityEdit />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/proposals/create" element={<ProposalCreate />} />
          <Route path="/proposals/:id" element={<ProposalDetails />} />
          <Route path="/proposals/:id/edit" element={<ProposalEdit />} />
          <Route path="/sales" element={<SalesAdmin />} />
          <Route path="/sales/:id" element={<SaleDetailsAdmin />} />
          <Route path="/commissions" element={<CommissionApproval />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/admin/follow-ups" element={<LeadFollowUpTemplates />} />
          <Route path="/qr" element={<WhatsAppQrCode />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <ToastContainer
        position="bottom-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
