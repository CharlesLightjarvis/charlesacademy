import { Component, type ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

type State = {
    error: string | null;
};

/**
 * Intercepte les erreurs de **rendu** du MDX (composant inconnu, expression
 * invalide…) pour afficher un message sous le contenu au lieu de faire
 * tomber toute la page. L'élément parent doit porter une `key` qui change
 * à chaque **compilation** (et non à chaque frappe) : sinon la frontière
 * se remonte trop tôt, avale l'ancienne erreur et reste bloquée.
 */
export class MdxErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: unknown): State {
        return {
            error: error instanceof Error ? error.message : String(error),
        };
    }

    componentDidCatch(error: Error): void {
        // Visible dans la console navigateur pour déboguer la leçon en MDX.
        console.error('Erreur de rendu MDX :', error);
    }

    render(): ReactNode {
        if (this.state.error !== null) {
            return (
                <p role="alert" className="text-sm text-destructive">
                    Erreur de rendu MDX : {this.state.error}
                </p>
            );
        }

        return this.props.children;
    }
}
