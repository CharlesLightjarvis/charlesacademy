import type { InertiaLinkProps } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';

export type IsParentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
) => boolean;

export type UseParentUrlReturn = {
    currentUrl: string;
    isParentUrl: IsParentUrlFn;
};

/**
 * Un lien est « parent » de l'URL courante quand celle-ci est un de ses
 * enfants (direct ou indirect) : `/learner/learn` est parent de
 * `/learner/learn/modules/salutations/lessons/bonjour`.
 *
 * La comparaison se fait segment par segment (jamais de préfixe brut),
 * pour éviter les collisions de chemins qui commencent pareil :
 * `/admin` n'est pas parent de `/administration`.
 */
export function useParentUrl(): UseParentUrlReturn {
    const { currentUrl } = useCurrentUrl();

    const toPath = (url: string): string => {
        if (!url.startsWith('http')) {
            return url.split(/[?#]/)[0];
        }

        try {
            return new URL(url).pathname;
        } catch {
            return url;
        }
    };

    const trimTrailingSlash = (path: string): string =>
        path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

    const isParentUrl: IsParentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrlOverride?: string,
    ) => {
        const parentPath = trimTrailingSlash(toPath(toUrl(urlToCheck)));
        const childPath = trimTrailingSlash(currentUrlOverride ?? currentUrl);

        return childPath.startsWith(`${parentPath}/`);
    };

    return {
        currentUrl,
        isParentUrl,
    };
}
