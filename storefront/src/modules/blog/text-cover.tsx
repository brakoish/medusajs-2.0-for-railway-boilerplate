import { BlogArticle, blogArticles } from "./articles"
import styles from "./text-cover.module.css"

export const BlogTextCover = ({ article }: { article: BlogArticle }) => (
  <div className={styles.frame} data-blog-cover aria-hidden="true">
    <div className={`${styles.cover} ${article.cover.dark ? styles.dark : styles.light}`}>
      <div className={styles.kicker}>{article.eyebrow}</div>
      <div className={styles.copy}>
        <div className={styles.title}>
          {article.cover.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <p className={styles.subtitle}>{article.cover.subtitle}</p>
      </div>
      <div className={styles.footer}>
        <b>DAB PAL</b>
        <span>
          FIELD NOTES / {String(blogArticles.indexOf(article) + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  </div>
)
