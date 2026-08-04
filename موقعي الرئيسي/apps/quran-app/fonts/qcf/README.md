# QCF per-page mushaf fonts

These are the King Fahd Complex per-page fonts used to reproduce the printed
Madani Mushaf (same files quran.com uses). The engine loads them in this order:

1. `fonts/qcf/QCF_PNNN.woff2`  (local — offline capable)
2. public CDN mirror (jsDelivr `gh/nuqayah/qpc-fonts`) — automatic fallback

`QCF_P001.woff2` … `QCF_P604.woff2` are the per-page fonts (~28–80KB each);
`QCF_BSML.woff2` is the decorative basmala ligature. Local copies for pages
1–10 are included so early pages render fully offline.

Source + license: https://github.com/nuqayah/qpc-fonts (mirror of the
mustafa0x/qpc-fonts dataset; see that repo's README for the official
qurancomplex.gov.sa source and license terms).
