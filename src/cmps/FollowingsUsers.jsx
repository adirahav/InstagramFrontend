import { Avatar } from "./Avatar"

export function FollowingsUsers({followings}) {

    return (
        <ul className="followings-users">
            {followings.map((follower, index) => (
                <li key={index}><Avatar size="big" textPosition="bottom" user={follower} /></li>
            ))}
        </ul>
    )
}
