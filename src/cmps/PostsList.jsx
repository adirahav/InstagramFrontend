import { useEffect } from "react"
import { PostPreview } from "./PostPreview"
import { LoadingIcon } from "../assets/icons"

export function PostsList({posts, onPostDetailsPress, variant}) {

    return (
        <section className='posts'>
            {posts.map((post, index) => (
                <PostPreview key={index} post={post} onPostDetailsPress={onPostDetailsPress} variant={variant}></PostPreview>
            ))}
            {true && <LoadingIcon.button />}
        </section>
    )
}
