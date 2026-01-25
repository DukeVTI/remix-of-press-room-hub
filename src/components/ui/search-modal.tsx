import React from 'react';
import {
	Modal,
	ModalContent,
	ModalTitle,
	ModalTrigger,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { LucideIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchCommandItem = {
	id: string;
	title: string;
	description: string;
	category: string;
	icon?: LucideIcon;
	shortcut?: string;
	href?: string;
};

type SearchModalProps = {
	children: React.ReactNode;
	data: SearchCommandItem[];
	onSelect?: (item: SearchCommandItem) => void;
};

export function SearchModal({ children, data, onSelect }: SearchModalProps) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState('');

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const handleSelect = (item: SearchCommandItem) => {
		setOpen(false);
		if (onSelect) {
			onSelect(item);
		}
	};

	return (
		<Modal open={open} onOpenChange={setOpen}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className="p-1">
				<ModalTitle className="sr-only">Search Press Room Publisher</ModalTitle>
				<Command className="bg-background md:bg-card rounded-md md:border">
					<CommandInput
						className={cn(
							'placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
						)}
						placeholder="Search blogs, posts, categories..."
						value={query}
						onValueChange={setQuery}
					/>
					<CommandList className="max-h-[380px] min-h-[280px] px-2 md:px-0">
						<CommandEmpty className="flex min-h-[200px] flex-col items-center justify-center">
							<SearchIcon className="text-muted-foreground mb-2 size-6" aria-hidden="true" />
							<p className="text-muted-foreground mb-1 text-sm">
								No results found for "{query}"
							</p>
							<Button onClick={() => setQuery('')} variant="ghost" size="sm">
								Clear search
							</Button>
						</CommandEmpty>
						<CommandGroup>
							{data.map((item) => {
								return (
									<CommandItem
										key={item.id}
										className="flex cursor-pointer items-center gap-3 py-3"
										value={item.title}
										onSelect={() => handleSelect(item)}
									>
										{item.icon && <item.icon className="size-5 text-muted-foreground" aria-hidden="true" />}
										<div className="flex flex-col flex-1 min-w-0">
											<p className="truncate text-sm font-medium">
												{item.title}
											</p>
											<p className="text-muted-foreground text-xs truncate">
												{item.description}
											</p>
										</div>
										<span className="text-muted-foreground text-xs bg-secondary px-2 py-0.5 rounded-full">
											{item.category}
										</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</ModalContent>
		</Modal>
	);
}
