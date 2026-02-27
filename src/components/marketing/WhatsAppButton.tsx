// Real WhatsApp link from the WordPress site
const WA_URL = "https://wa.me/message/M4SMC34XJ63JA1";

export function WhatsAppButton() {
    return (
        <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 9999,
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.35)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.28)";
            }}
        >
            <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.347.633 4.549 1.737 6.452L2.667 29.333l7.072-1.713A13.29 13.29 0 0016.003 29.333C23.364 29.333 29.333 23.364 29.333 16c0-7.364-5.969-13.333-13.33-13.333zm0 24a11.3 11.3 0 01-5.826-1.614l-.418-.249-4.198 1.016 1.055-4.09-.273-.43A11.302 11.302 0 014.667 16c0-6.249 5.086-11.333 11.336-11.333S27.333 9.751 27.333 16s-5.083 11.333-11.33 11.333zm6.21-8.49c-.341-.17-2.016-.994-2.329-1.107-.312-.113-.539-.17-.766.17-.228.341-.882 1.107-1.081 1.335-.199.227-.397.256-.738.086-.341-.17-1.44-.531-2.742-1.692-1.013-.904-1.697-2.02-1.896-2.361-.199-.341-.021-.525.15-.694.154-.153.341-.399.512-.598.17-.2.227-.341.341-.569.113-.227.057-.426-.028-.598-.086-.17-.766-1.847-1.05-2.53-.277-.664-.558-.574-.766-.584l-.653-.011a1.253 1.253 0 00-.909.426c-.312.341-1.193 1.165-1.193 2.843s1.221 3.298 1.392 3.525c.17.228 2.403 3.668 5.822 5.144.814.351 1.449.561 1.944.718.817.26 1.561.224 2.148.136.655-.098 2.016-.824 2.3-1.62.284-.795.284-1.478.199-1.62-.086-.142-.312-.228-.653-.399z" />
            </svg>
        </a>
    );
}
