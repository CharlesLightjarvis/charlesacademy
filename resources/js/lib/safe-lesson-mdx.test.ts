import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mdxComponents } from '../components/mdx-components';
import { compileLessonMdx } from './compile-lesson-mdx';

async function compileLesson(source: string): Promise<void> {
    await compileLessonMdx(source);
}

test('a lesson keeps supported Markdown and teaching components', async () => {
    await assert.doesNotReject(
        compileLesson(
            '# Bonjour\n\n<Callout tone="tip">Essaye.</Callout>\n\n<LetterGrid letters="ABC" />',
        ),
    );
});

test('a lesson refuses executable MDX and unsafe links', async () => {
    for (const source of [
        '{globalThis.alert(1)}',
        'export const stolen = document.cookie',
        '<img src="x" onError="alert(1)" />',
        '<Callout tone={globalThis.alert(1)}>Test</Callout>',
        '[Clique](javascript:alert(1))',
    ]) {
        await assert.rejects(compileLesson(source), source);
    }
});

test('the legacy alphabet grid renders all German letters and keeps the lesson text', async () => {
    const legacySource = [
        '## 1 - L’alphabet allemand',
        '',
        '<style>{` .alphabet-grid { display: grid; } `}</style>',
        '<div className="alphabet-grid not-prose">',
        '  {[ ["A", "a"], ["Ä", "è"], ["ß", "ès-tsèt"] ].map(([letter, name]) => (',
        '    <div key={letter}><span>{name}</span><div>{letter}</div></div>',
        '  ))}',
        '</div>',
        '',
        '## Les caractères particuliers',
        '',
        '**Ä, Ö et Ü** sont des voyelles.',
    ].join('\n');

    const { default: Lesson } = await compileLessonMdx(legacySource);
    const html = renderToStaticMarkup(
        createElement(Lesson, { components: mdxComponents }),
    );

    assert.match(html, /Les caractères particuliers/);
    assert.match(html, /ès-tsèt/);
    assert.match(html, /tsett/);
    assert.match(html, /Käse|voyelles/);
    assert.equal((html.match(/shadow-sm/g) ?? []).length, 30);
    assert.doesNotMatch(html, /alphabet-grid|<style>/);
});

test('executable content outside the legacy alphabet block remains forbidden', async () => {
    await assert.rejects(
        compileLesson(
            '<style>{`x`}</style>\n<div className="alphabet-grid not-prose">x</div>\n\n## Les caractères particuliers\n\n{globalThis.alert(1)}',
        ),
    );
});

test('a different style block is not treated as the legacy alphabet', async () => {
    await assert.rejects(
        compileLesson(
            '<style>{`x`}</style>\n<div className="alphabet-grid not-prose">x</div>\n\n## Les caractères particuliers',
        ),
    );
});
