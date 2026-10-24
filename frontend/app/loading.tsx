export default function Loading() {
  return (
    <main className="signup-loading" aria-busy="true" aria-live="polite">
      <div className="signup-loading__content">
        <div className="signup-loading__logo" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <h1>Sign up on hepfol</h1>
        <p className="signup-loading__subtitle">
          Sign up and get started with your free 3 credits
        </p>

        <div className="signup-loading__google skeleton">
          <span className="signup-loading__google-mark" aria-hidden="true">
            G
          </span>
          <span>Continue with Google</span>
        </div>

        <p className="signup-loading__login">
          Already have an account? <span>Log in</span>
        </p>

        <div className="signup-loading__divider">
          <span />
          <span>or</span>
          <span />
        </div>

        <section
          className="signup-loading__form"
          aria-label="Loading sign-up form"
        >
          <label>
            Email
            <span className="skeleton signup-loading__input" />
          </label>

          <label>
            Password
            <span className="skeleton signup-loading__input" />
          </label>

          <p className="signup-loading__hint">
            Must contain atleast one uppercase, lowercase, digit, symbol and
            minimum of 8 characters
          </p>

          <div className="skeleton signup-loading__button">Sign up</div>
        </section>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .signup-loading {
          min-height: 100vh;
          padding: 12px;
          display: flex;
          justify-content: center;
          background: #080809;
          color: #f5f5f7;
          font-family: Arial, Helvetica, sans-serif;
        }

        .signup-loading__content {
          width: min(100%, 576px);
          padding-top: 8px;
        }

        .signup-loading__logo {
          height: 34px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 4px;
          overflow: hidden;
        }

        .signup-loading__logo span {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #a900d6;
        }

        .signup-loading__logo span:nth-child(2) {
          width: 30px;
          height: 30px;
          margin-top: -4px;
        }

        .signup-loading h1 {
          margin: 0;
          text-align: center;
          font-size: clamp(30px, 8vw, 44px);
          line-height: 1.25;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .signup-loading__subtitle {
          margin: 18px 0 42px;
          text-align: center;
          color: #a1a1aa;
          font-size: 20px;
          line-height: 1.4;
        }

        .signup-loading__google {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #d1d5db;
          border-radius: 13px;
          background: #fff;
          color: #374151;
          font-size: 21px;
        }

        .signup-loading__google-mark {
          font-size: 23px;
          font-weight: 700;
          color: #4285f4;
        }

        .signup-loading__login {
          margin: 38px 0 40px;
          text-align: center;
          color: #a1a1aa;
          font-size: 20px;
        }

        .signup-loading__login span {
          color: #c26bff;
        }

        .signup-loading__divider {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
          color: #a1a1aa;
          font-size: 20px;
        }

        .signup-loading__divider span:first-child,
        .signup-loading__divider span:last-child {
          height: 1px;
          flex: 1;
          background: #242428;
        }

        .signup-loading__form label {
          display: block;
          margin-bottom: 36px;
          font-size: 20px;
          font-weight: 600;
        }

        .signup-loading__input {
          display: block;
          height: 54px;
          margin-top: 14px;
          border: 1px solid #343438;
          border-radius: 15px;
        }

        .signup-loading__hint {
          margin: -22px 0 50px;
          color: #a1a1aa;
          font-size: 20px;
          line-height: 1.5;
        }

        .signup-loading__button {
          height: 57px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: #4b0c70;
          color: #85808c;
          font-size: 20px;
          font-weight: 700;
        }

        .skeleton {
          position: relative;
          overflow: hidden;
        }

        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgb(255 255 255 / 8%),
            transparent
          );
          animation: signup-shimmer 1.5s infinite;
        }

        @keyframes signup-shimmer {
          to {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton::after {
            animation: none;
          }
        }

        @media (max-width: 420px) {
          .signup-loading__subtitle,
          .signup-loading__login,
          .signup-loading__hint {
            font-size: 17px;
          }

          .signup-loading__google {
            font-size: 18px;
          }

          .signup-loading__form label {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  );
}
