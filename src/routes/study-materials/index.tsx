import { createFileRoute } from '@tanstack/react-router'
import StudyMaterialList from './-sections/material-list'
import { mockStudyMaterials } from '@/data/mock-material'

export const Route = createFileRoute('/study-materials/')({
  loader: () => ({data: mockStudyMaterials}),
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <>
      <div className="mt-3 mb-5">
        <h1 className='text-3xl font-black text-telnet-primary tracking-tight'>
          Study Materials 
        </h1>
        <p className='text-muted-foreground'>
          Daftar materi pelajaran tentang Media dan Jaringan Telekomunikasi 
        </p>
      </div>
      <StudyMaterialList studyMaterials={data}/>
    </>
  )
}
