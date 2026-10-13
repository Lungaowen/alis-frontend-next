"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isLogin = mode === "login";
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Account access is not connected to this deployment yet. Your details have not been sent or stored.");
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" className="mkt-brand" aria-label="ALIS home"><span className="mkt-brand-mark"><Icon name="shield" size={21}/></span><span className="mkt-brand-text"><strong>ALIS</strong><small>Legal intelligence</small></span></Link>
        <div className="auth-story-content"><div className="auth-story-overline">Legal clarity starts here</div><h1>{isLogin ? <>Good to have you <em>back.</em></> : <>Make room for a more <em>informed</em> next step.</>}</h1><p>{isLogin ? "Return to your workspace to pick up the documents, questions and matter details you have been organising." : "Create a workspace for legal questions, important documents and the details you need to keep in view."}</p><div className="auth-story-list"><div className="auth-story-point"><span><Icon name="document" size={13}/></span>Documents and questions, together</div><div className="auth-story-point"><span><Icon name="folder" size={13}/></span>A structured record of each matter</div><div className="auth-story-point"><span><Icon name="shield" size={13}/></span>Clear limits, with human judgment at the centre</div></div></div>
        <div className="auth-story-foot">Designed for legal-information workflows in South Africa.</div>
      </section>
      <section className="auth-main">
        <div className="auth-topline">{isLogin ? <>New to ALIS? <Link href="/register">Create an account</Link></> : <>Already have an account? <Link href="/login">Sign in</Link></>}</div>
        <div className="auth-form-wrap">
          <div className="auth-form-eyebrow">{isLogin ? "Your workspace awaits" : "Start with the essentials"}</div>
          <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p className="auth-form-intro">{isLogin ? "Enter your details to continue to your ALIS workspace." : "Set up your account and create a more organised place for your legal work."}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && <div className="auth-field"><label htmlFor="full-name">Full name</label><input autoComplete="name" id="full-name" name="name" placeholder="Your full name" required /></div>}
            <div className="auth-field"><label htmlFor="email-address">Email address</label><input autoComplete="email" id="email-address" name="email" type="email" placeholder="you@example.com" required /></div>
            {!isLogin && <div className="auth-field"><label htmlFor="account-type">I’m creating an account for</label><select id="account-type" name="accountType" defaultValue="personal"><option value="personal">Myself</option><option value="business">A business</option><option value="professional">Legal or professional work</option></select></div>}
            <div className="auth-field"><label htmlFor="password">Password</label><div style={{position:"relative"}}><input autoComplete={isLogin ? "current-password" : "new-password"} id="password" name="password" type={showPassword ? "text" : "password"} placeholder={isLogin ? "Enter your password" : "Create a password"} minLength={8} required style={{paddingRight:84}}/><button type="button" className="auth-muted-button" onClick={() => setShowPassword(!showPassword)} style={{position:"absolute",right:12,top:12}}>{showPassword ? "Hide" : "Show"}</button></div>{!isLogin && <span style={{fontSize:9,color:"#919a91"}}>Use at least 8 characters.</span>}</div>
            {isLogin && <div className="auth-form-options"><label className="auth-remember"><input type="checkbox" name="remember"/> Keep me signed in</label><button type="button" className="auth-muted-button" onClick={() => setNotice("Password reset is not connected to this deployment yet. No email has been sent.")}>Forgot password?</button></div>}
            <button type="submit" className="auth-submit">{isLogin ? "Sign in to ALIS" : "Create account"}<Icon name="arrow" size={14}/></button>
            {notice && <div className="auth-feedback" role="status">{notice}</div>}
          </form>
          <div className="auth-divider" style={{marginTop:22}}>A more considered place for legal work</div>
          <p className="auth-legal-note">ALIS supports legal information and organisation. It does not replace advice from a qualified legal practitioner. This account form is a preview until authentication is connected.</p>
        </div>
        <div className="auth-support"><Link href="/">← Back to ALIS</Link></div>
      </section>
    </main>
  );
}
