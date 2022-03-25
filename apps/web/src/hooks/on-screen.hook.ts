import { MutableRefObject, useEffect, useState } from 'react';

/**
 * Returns if the element with the given ref is currently visible on the screen
 */
export default function useOnScreen(ref: MutableRefObject<HTMLElement>) {
    const [isIntersecting, setIntersecting] = useState(false);

    const observer = new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
    );

    useEffect(() => {
        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);

    return isIntersecting;
}
