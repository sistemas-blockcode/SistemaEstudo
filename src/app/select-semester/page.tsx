import  prisma  from '@/lib/prisma';
import SemesterModal from '@/components/SemesterModal';
export const dynamic = 'force-dynamic';

export default async function SelectSemesterPage() {
  const semesters = await prisma.semester.findMany({
    select: { id: true, numero: true, descricao: true },
    orderBy: { numero: 'asc' },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SemesterModal semesters={semesters} />
    </div>
  );
}
