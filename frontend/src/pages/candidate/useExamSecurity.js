import { useEffect } from "react";

export default function useExamSecurity(onViolation) {
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) onViolation("Tab switch detected");
        };

        const handleBlur = () => onViolation("Window focus lost");

        const handleReload = (e) => {
            e.preventDefault();
            onViolation("Page refresh attempt");
            e.returnValue = "";
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("beforeunload", handleReload);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("beforeunload", handleReload);
        };
    }, [onViolation]);
}
