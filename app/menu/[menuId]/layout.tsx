import { Metadata } from 'next';
import { generateMenuMetadata } from './metadata';

type Props = {
  params: Promise<{ menuId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuId } = await params;
  return generateMenuMetadata(menuId);
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

