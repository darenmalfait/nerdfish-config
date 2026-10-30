import { Avatar } from '../../../components/avatar'
import { type User } from '../api/get-user'

export function UserCard({ user }: { user: User }) {
	return (
		<div>
			<Avatar name={user.name} />
			{user.name}
		</div>
	)
}
