import React from "react";

type LoaderProps = {
  variant?: "page" | "component";
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
};

const Loader: React.FC<LoaderProps> = ({
  variant = "component",
  size = 84,
  primaryColor = "#FF3D00",
  secondaryColor = "#ffffff",
}) => {
  const containerStyle: React.CSSProperties =
    variant === "page"
      ? {
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.1)",
          zIndex: 9999,
        }
      : {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        };

  return (
    <>
      <div style={containerStyle}>
        <span
          className="loader"
          style={
            {
              "--loader-size": `${size}px`,
              "--primary": primaryColor,
              "--secondary": secondaryColor,
            } as React.CSSProperties
          }
        />
      </div>

      <style>{`
        .loader {
          width: var(--loader-size);
          height: var(--loader-size);
          position: relative;
          display: block;
        }

        .loader:before,
        .loader:after {
          content: "";
          position: absolute;
          right: 0;
          top: 0;
          width: var(--loader-size);
          height: var(--loader-size);
          border-radius: 50%;
          background: var(--primary);
          animation: push 1s infinite linear alternate;
        }

        .loader:after {
          top: auto;
          bottom: 0;
          left: 0;
          background: var(--secondary);
          animation-direction: alternate-reverse;
        }

        @keyframes push {
          0% {
            width: 14px;
            height: 14px;
          }
          100% {
            width: var(--loader-size);
            height: var(--loader-size);
          }
        }
      `}</style>
    </>
  );
};

export default Loader;