interface NotFoundProps {
	message: string;
}

export default function NotFound({ message }: NotFoundProps) {
	return (
		<div className="flex flex-col justify-center align-center items-center min-h-screen">
			<h1 className="text-2xl text-center">{message}</h1>
		</div>
	);
}
