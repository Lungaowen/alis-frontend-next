import Person from "@mui/icons-material/Person";
import Business from "@mui/icons-material/Business";
import Home from "@mui/icons-material/Home";
import Devices from "@mui/icons-material/Devices";
import Security from "@mui/icons-material/Security";
import { AlisShell } from "@/components/alis-shell";

const sections = [
  { icon: Person, title: "Personal context", description: "Basic details and circumstances you choose to keep alongside relevant matters.", status: "Not configured" },
  { icon: Business, title: "Work and business", description: "Employment, contracts, business activity and related records where they are relevant.", status: "Not configured" },
  { icon: Home, title: "Property and household", description: "Property, rental and household context that may help explain a situation.", status: "Not configured" },
  { icon: Devices, title: "Digital and online", description: "Relevant accounts, online transactions and digital evidence you are authorised to share.", status: "Not configured" },
];

export default function Profile() {
  return (
    <AlisShell>
      <section className="page-intro">
        <div><p className="page-kicker">Legal safety profile</p><h1 className="page-title">Your context, under your control.</h1><p className="page-description">Useful background may prevent you from repeating the same information for every matter. Only add context when it helps, and keep sensitive details to what is necessary.</p></div>
        <span className="sample-label">Profile preview</span>
      </section>

      <div className="notice-box" style={{ marginBottom: 18 }}><Security /><div><strong>Designed for explicit control</strong><p>Profile storage and consent controls must be enforced by the backend. These cards are a design preview and are not currently saving personal information.</p></div></div>

      <section className="profile-grid">
        {sections.map((section) => {
          const Icon = section.icon;
          return <article className="profile-card" key={section.title}><span className="profile-icon"><Icon /></span><span><h2>{section.title}</h2><p>{section.description}</p><span className="profile-card-foot">{section.status}</span></span></article>;
        })}
      </section>
    </AlisShell>
  );
}
