import React from 'react';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import TOC from '@theme/TOC';

/**
 * Wraps the default desktop TOC ("ON THIS PAGE") and appends a meta box
 * (version · updated + an ask link) at the bottom — the "Pulse" direction
 * affordance from the Halo Docs reference. The box only renders when the
 * doc's frontmatter defines the halo_* fields, so it stays scoped to the
 * Pulse-styled pages and leaves every other doc untouched.
 */
export default function DocItemTOCDesktop(): JSX.Element {
  const { toc, frontMatter } = useDoc();
  const fm = frontMatter as Record<string, string | undefined>;
  const version = fm.halo_version;
  const updated = fm.halo_updated;
  const askHref = fm.halo_ask_href;
  const askLabel = fm.halo_ask_label ?? 'Gửi yêu cầu hỗ trợ';
  const hasMeta = Boolean(version || updated || askHref);

  return (
    <>
      <TOC
        toc={toc}
        minHeadingLevel={frontMatter.toc_min_heading_level}
        maxHeadingLevel={frontMatter.toc_max_heading_level}
        className={ThemeClassNames.docs.docTocDesktop}
      />
      {hasMeta && (
        <div className="hd-toc-meta">
          {(version || updated) && (
            <div className="hd-toc-meta-line">
              {version}
              {version && updated ? ' · ' : ''}
              {updated}
            </div>
          )}
          {askHref && (
            <Link className="hd-toc-meta-ask" to={askHref}>
              {askLabel} →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
