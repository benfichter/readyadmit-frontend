import { useEffect, useRef } from 'react';


export function useDebouncedEffect(effect, deps, delay = 600) {
const first = useRef(true);
useEffect(() => {
if (first.current) { first.current = false; return; }
const id = setTimeout(effect, delay);
return () => clearTimeout(id);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, deps);
}