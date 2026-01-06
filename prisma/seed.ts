import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'

// Load .env.local
config({ path: '.env.local' })

// Use direct connection for seeding (not the serverless adapter)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create superadmin user
  const superadmin = await prisma.user.upsert({
    where: { email: 'rapha.uy@rapha.uy' },
    update: {},
    create: {
      email: 'rapha.uy@rapha.uy',
      name: 'Raphael',
      role: Role.superadmin,
      isActive: true,
    },
  })

  console.log(`✅ Created superadmin: ${superadmin.email}`)

  // Create educators
  const educator1 = await prisma.educator.upsert({
    where: { id: 'edu1' },
    update: {},
    create: {
      id: 'edu1',
      name: 'María González',
      title: 'WSET Level 3, Sommelier Profesional',
      bio: 'Sommelier con más de 10 años de experiencia en la industria vitivinícola argentina. Especializada en vinos del Nuevo Mundo y maridajes.',
      imageUrl: 'https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=400&h=400&fit=crop',
      user: {
        create: {
          email: 'maria@tintaacademy.com',
          name: 'María González',
          role: Role.educator,
        }
      }
    }
  })

  const educator2 = await prisma.educator.upsert({
    where: { id: 'edu2' },
    update: {},
    create: {
      id: 'edu2',
      name: 'Carlos Mendoza',
      title: 'WSET Diploma, Enólogo',
      bio: 'Enólogo y educador certificado con experiencia en bodegas de Mendoza. Apasionado por compartir el conocimiento sobre terroir y vinificación.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      user: {
        create: {
          email: 'carlos@tintaacademy.com',
          name: 'Carlos Mendoza',
          role: Role.educator,
        }
      }
    }
  })

  const educator3 = await prisma.educator.upsert({
    where: { id: 'edu3' },
    update: {},
    create: {
      id: 'edu3',
      name: 'Lucía Fernández',
      title: 'Master Sommelier',
      bio: 'Master Sommelier y consultora internacional. Especialista en vinos de alta gama y educación sensorial avanzada.',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      user: {
        create: {
          email: 'lucia@tintaacademy.com',
          name: 'Lucía Fernández',
          role: Role.educator,
        }
      }
    }
  })

  console.log('✅ Created educators')

  // Create tags
  const tagWSET = await prisma.tag.upsert({
    where: { slug: 'wset' },
    update: {},
    create: {
      name: 'WSET',
      slug: 'wset',
    }
  })

  const tagArgentinos = await prisma.tag.upsert({
    where: { slug: 'vinos-argentinos' },
    update: {},
    create: {
      name: 'Vinos Argentinos',
      slug: 'vinos-argentinos',
    }
  })

  const tagCata = await prisma.tag.upsert({
    where: { slug: 'cata' },
    update: {},
    create: {
      name: 'Cata',
      slug: 'cata',
    }
  })

  const tagMaridaje = await prisma.tag.upsert({
    where: { slug: 'maridaje' },
    update: {},
    create: {
      name: 'Maridaje',
      slug: 'maridaje',
    }
  })

  const tagPrincipiante = await prisma.tag.upsert({
    where: { slug: 'principiante' },
    update: {},
    create: {
      name: 'Principiante',
      slug: 'principiante',
    }
  })

  const tagAvanzado = await prisma.tag.upsert({
    where: { slug: 'avanzado' },
    update: {},
    create: {
      name: 'Avanzado',
      slug: 'avanzado',
    }
  })

  console.log('✅ Created tags')

  // Create courses
  await prisma.course.upsert({
    where: { slug: 'wset-nivel-2-marzo' },
    update: {},
    create: {
      slug: 'wset-nivel-2-marzo',
      title: 'WSET Nivel 2 en Vinos',
      type: 'wset',
      modality: 'presencial',
      description: 'Certificación internacional WSET Nivel 2. Aprende sobre las principales regiones vitivinícolas del mundo, variedades de uva, y técnicas de cata profesional.',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-04-15'),
      duration: '5 semanas',
      maxCapacity: 20,
      enrolledCount: 12,
      priceUSD: 850,
      location: 'Buenos Aires',
      address: 'Av. Libertador 1234, CABA',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
      status: 'enrolling',
      educatorId: educator1.id,
      wsetLevel: 2,
      tags: {
        connect: [{ id: tagWSET.id }, { id: tagAvanzado.id }]
      }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'introduccion-vinos-argentinos' },
    update: {},
    create: {
      slug: 'introduccion-vinos-argentinos',
      title: 'Introducción a los Vinos Argentinos',
      type: 'curso',
      modality: 'online',
      description: 'Descubre la riqueza vitivinícola argentina. Desde Malbec hasta Torrontés, explora las regiones y estilos que hacen únicos a nuestros vinos.',
      startDate: new Date('2024-02-20'),
      endDate: new Date('2024-02-20'),
      duration: '4 horas',
      maxCapacity: 100,
      enrolledCount: 45,
      priceUSD: 65,
      status: 'available',
      educatorId: educator2.id,
      tags: {
        connect: [{ id: tagArgentinos.id }, { id: tagPrincipiante.id }]
      }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'taller-maridaje-quesos' },
    update: {},
    create: {
      slug: 'taller-maridaje-quesos',
      title: 'Taller de Maridaje: Vinos y Quesos',
      type: 'taller',
      modality: 'presencial',
      description: 'Aprende los secretos del maridaje perfecto entre vinos y quesos. Incluye degustación de 6 vinos y 8 variedades de quesos artesanales.',
      startDate: new Date('2024-02-28'),
      endDate: new Date('2024-02-28'),
      duration: '3 horas',
      maxCapacity: 16,
      enrolledCount: 16,
      priceUSD: 120,
      location: 'Mendoza',
      address: 'Bodega Los Andes, Luján de Cuyo',
      imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=600&fit=crop',
      status: 'full',
      educatorId: educator3.id,
      tags: {
        connect: [{ id: tagMaridaje.id }, { id: tagCata.id }]
      }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'cata-ciega-avanzada' },
    update: {},
    create: {
      slug: 'cata-ciega-avanzada',
      title: 'Cata a Ciegas: Técnicas Avanzadas',
      type: 'cata',
      modality: 'presencial',
      description: 'Perfecciona tus habilidades de cata con técnicas profesionales. Aprende a identificar variedades, regiones y añadas sin ver la etiqueta.',
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-10'),
      duration: '4 horas',
      maxCapacity: 12,
      enrolledCount: 8,
      priceUSD: 95,
      location: 'Córdoba',
      address: 'Hotel Azur, Nueva Córdoba',
      imageUrl: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop',
      status: 'enrolling',
      educatorId: educator1.id,
      tags: {
        connect: [{ id: tagCata.id }, { id: tagAvanzado.id }]
      }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'wset-nivel-3-intensivo' },
    update: {},
    create: {
      slug: 'wset-nivel-3-intensivo',
      title: 'WSET Nivel 3 Intensivo',
      type: 'wset',
      modality: 'presencial',
      description: 'Programa intensivo de certificación WSET Nivel 3. Profundiza en viticultura, vinificación y evaluación sensorial a nivel profesional.',
      startDate: new Date('2024-04-20'),
      endDate: new Date('2024-05-20'),
      duration: '4 semanas intensivas',
      maxCapacity: 15,
      enrolledCount: 5,
      priceUSD: 1500,
      location: 'Buenos Aires',
      address: 'Centro de Convenciones Recoleta',
      imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop',
      status: 'announced',
      educatorId: educator3.id,
      wsetLevel: 3,
      tags: {
        connect: [{ id: tagWSET.id }, { id: tagAvanzado.id }]
      }
    }
  })

  // Add a past course
  await prisma.course.upsert({
    where: { slug: 'historia-vino-argentino' },
    update: {},
    create: {
      slug: 'historia-vino-argentino',
      title: 'Historia del Vino Argentino',
      type: 'curso',
      modality: 'online',
      description: 'Un recorrido por la fascinante historia de la vitivinicultura argentina, desde la época colonial hasta nuestros días.',
      startDate: new Date('2023-11-15'),
      endDate: new Date('2023-11-15'),
      duration: '2 horas',
      maxCapacity: 50,
      enrolledCount: 48,
      priceUSD: 35,
      status: 'finished',
      educatorId: educator2.id,
      tags: {
        connect: [{ id: tagArgentinos.id }, { id: tagPrincipiante.id }]
      }
    }
  })

  console.log('✅ Created courses')

  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
