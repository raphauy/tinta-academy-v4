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
    update: {
      name: 'María González',
      title: 'WSET Level 3, Sommelier Profesional',
      bio: 'Sommelier con más de 10 años de experiencia en la industria vitivinícola chilena. Especializada en vinos del Valle de Colchagua y maridajes.',
      imageUrl: 'https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=400&h=400&fit=crop',
    },
    create: {
      id: 'edu1',
      name: 'María González',
      title: 'WSET Level 3, Sommelier Profesional',
      bio: 'Sommelier con más de 10 años de experiencia en la industria vitivinícola chilena. Especializada en vinos del Valle de Colchagua y maridajes.',
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
    update: {
      name: 'Carlos Valdés',
      title: 'WSET Diploma, Enólogo',
      bio: 'Enólogo y educador certificado con experiencia en viñas del Valle del Maipo. Apasionado por compartir el conocimiento sobre terroir y vinificación.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    },
    create: {
      id: 'edu2',
      name: 'Carlos Valdés',
      title: 'WSET Diploma, Enólogo',
      bio: 'Enólogo y educador certificado con experiencia en viñas del Valle del Maipo. Apasionado por compartir el conocimiento sobre terroir y vinificación.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      user: {
        create: {
          email: 'carlos@tintaacademy.com',
          name: 'Carlos Valdés',
          role: Role.educator,
        }
      }
    }
  })

  const educator3 = await prisma.educator.upsert({
    where: { id: 'edu3' },
    update: {
      name: 'Lucía Fernández',
      title: 'Master Sommelier',
      bio: 'Master Sommelier y consultora internacional. Especialista en vinos de alta gama y educación sensorial avanzada.',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
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
    update: { name: 'WSET' },
    create: { name: 'WSET', slug: 'wset' }
  })

  const tagChilenos = await prisma.tag.upsert({
    where: { slug: 'vinos-chilenos' },
    update: { name: 'Vinos Chilenos' },
    create: { name: 'Vinos Chilenos', slug: 'vinos-chilenos' }
  })

  const tagCata = await prisma.tag.upsert({
    where: { slug: 'cata' },
    update: { name: 'Cata' },
    create: { name: 'Cata', slug: 'cata' }
  })

  const tagMaridaje = await prisma.tag.upsert({
    where: { slug: 'maridaje' },
    update: { name: 'Maridaje' },
    create: { name: 'Maridaje', slug: 'maridaje' }
  })

  const tagPrincipiante = await prisma.tag.upsert({
    where: { slug: 'principiante' },
    update: { name: 'Principiante' },
    create: { name: 'Principiante', slug: 'principiante' }
  })

  const tagAvanzado = await prisma.tag.upsert({
    where: { slug: 'avanzado' },
    update: { name: 'Avanzado' },
    create: { name: 'Avanzado', slug: 'avanzado' }
  })

  console.log('✅ Created tags')

  // Create courses (all with future dates)
  await prisma.course.upsert({
    where: { slug: 'wset-nivel-2-marzo' },
    update: {
      title: 'WSET Nivel 2 en Vinos',
      description: 'Certificación internacional WSET Nivel 2. Aprende sobre las principales regiones vitivinícolas del mundo, variedades de uva, y técnicas de cata profesional.',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-04-15'),
      duration: '5 semanas',
      maxCapacity: 20,
      priceUSD: 850,
      location: 'Montevideo',
      address: 'Pocitos, Montevideo',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
      status: 'enrolling',
      tags: { set: [{ id: tagWSET.id }, { id: tagAvanzado.id }] }
    },
    create: {
      slug: 'wset-nivel-2-marzo',
      title: 'WSET Nivel 2 en Vinos',
      type: 'wset',
      modality: 'presencial',
      description: 'Certificación internacional WSET Nivel 2. Aprende sobre las principales regiones vitivinícolas del mundo, variedades de uva, y técnicas de cata profesional.',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-04-15'),
      duration: '5 semanas',
      maxCapacity: 20,
      enrolledCount: 12,
      priceUSD: 850,
      location: 'Montevideo',
      address: 'Pocitos, Montevideo',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
      status: 'enrolling',
      educatorId: educator1.id,
      wsetLevel: 2,
      tags: { connect: [{ id: tagWSET.id }, { id: tagAvanzado.id }] }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'introduccion-vinos-chilenos' },
    update: {
      title: 'Introducción a los Vinos Chilenos',
      description: 'Descubre la riqueza vitivinícola chilena. Desde Carmenère hasta Sauvignon Blanc, explora los valles y estilos que hacen únicos a nuestros vinos.',
      startDate: null,
      endDate: null,
      duration: '4 horas',
      maxCapacity: 100,
      priceUSD: 65,
      imageUrl: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800&h=600&fit=crop',
      status: 'available',
      tags: { set: [{ id: tagChilenos.id }, { id: tagPrincipiante.id }] }
    },
    create: {
      slug: 'introduccion-vinos-chilenos',
      title: 'Introducción a los Vinos Chilenos',
      type: 'curso',
      modality: 'online',
      description: 'Descubre la riqueza vitivinícola chilena. Desde Carmenère hasta Sauvignon Blanc, explora los valles y estilos que hacen únicos a nuestros vinos.',
      startDate: null,
      endDate: null,
      duration: '4 horas',
      maxCapacity: 100,
      enrolledCount: 45,
      priceUSD: 65,
      imageUrl: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800&h=600&fit=crop',
      status: 'available',
      educatorId: educator2.id,
      tags: { connect: [{ id: tagChilenos.id }, { id: tagPrincipiante.id }] }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'taller-maridaje-quesos' },
    update: {
      title: 'Taller de Maridaje: Vinos y Quesos',
      description: 'Aprende los secretos del maridaje perfecto entre vinos y quesos. Incluye degustación de 6 vinos y 8 variedades de quesos artesanales.',
      startDate: new Date('2026-02-28'),
      endDate: new Date('2026-02-28'),
      duration: '3 horas',
      maxCapacity: 16,
      priceUSD: 120,
      location: 'Valle de Colchagua',
      address: 'Viña Santa Cruz, Santa Cruz',
      imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=600&fit=crop',
      status: 'enrolling',
      tags: { set: [{ id: tagMaridaje.id }, { id: tagCata.id }] }
    },
    create: {
      slug: 'taller-maridaje-quesos',
      title: 'Taller de Maridaje: Vinos y Quesos',
      type: 'taller',
      modality: 'presencial',
      description: 'Aprende los secretos del maridaje perfecto entre vinos y quesos. Incluye degustación de 6 vinos y 8 variedades de quesos artesanales.',
      startDate: new Date('2026-02-28'),
      endDate: new Date('2026-02-28'),
      duration: '3 horas',
      maxCapacity: 16,
      enrolledCount: 14,
      priceUSD: 120,
      location: 'Valle de Colchagua',
      address: 'Viña Santa Cruz, Santa Cruz',
      imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&h=600&fit=crop',
      status: 'enrolling',
      educatorId: educator3.id,
      tags: { connect: [{ id: tagMaridaje.id }, { id: tagCata.id }] }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'cata-ciega-avanzada' },
    update: {
      title: 'Cata a Ciegas: Técnicas Avanzadas',
      description: 'Perfecciona tus habilidades de cata con técnicas profesionales. Aprende a identificar variedades, regiones y añadas sin ver la etiqueta.',
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-10'),
      duration: '4 horas',
      maxCapacity: 12,
      priceUSD: 95,
      location: 'Valparaíso',
      address: 'Hotel Boutique, Cerro Alegre',
      imageUrl: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop',
      status: 'enrolling',
      tags: { set: [{ id: tagCata.id }, { id: tagAvanzado.id }] }
    },
    create: {
      slug: 'cata-ciega-avanzada',
      title: 'Cata a Ciegas: Técnicas Avanzadas',
      type: 'cata',
      modality: 'presencial',
      description: 'Perfecciona tus habilidades de cata con técnicas profesionales. Aprende a identificar variedades, regiones y añadas sin ver la etiqueta.',
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-10'),
      duration: '4 horas',
      maxCapacity: 12,
      enrolledCount: 8,
      priceUSD: 95,
      location: 'Valparaíso',
      address: 'Hotel Boutique, Cerro Alegre',
      imageUrl: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop',
      status: 'enrolling',
      educatorId: educator1.id,
      tags: { connect: [{ id: tagCata.id }, { id: tagAvanzado.id }] }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'wset-nivel-3-intensivo' },
    update: {
      title: 'WSET Nivel 3 Intensivo',
      description: 'Programa intensivo de certificación WSET Nivel 3. Profundiza en viticultura, vinificación y evaluación sensorial a nivel profesional.',
      startDate: new Date('2026-04-20'),
      endDate: new Date('2026-05-20'),
      duration: '4 semanas intensivas',
      maxCapacity: 15,
      priceUSD: 1500,
      location: 'Santiago',
      address: 'Las Condes, Santiago',
      imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop',
      status: 'announced',
      tags: { set: [{ id: tagWSET.id }, { id: tagAvanzado.id }] }
    },
    create: {
      slug: 'wset-nivel-3-intensivo',
      title: 'WSET Nivel 3 Intensivo',
      type: 'wset',
      modality: 'presencial',
      description: 'Programa intensivo de certificación WSET Nivel 3. Profundiza en viticultura, vinificación y evaluación sensorial a nivel profesional.',
      startDate: new Date('2026-04-20'),
      endDate: new Date('2026-05-20'),
      duration: '4 semanas intensivas',
      maxCapacity: 15,
      enrolledCount: 5,
      priceUSD: 1500,
      location: 'Santiago',
      address: 'Las Condes, Santiago',
      imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop',
      status: 'announced',
      educatorId: educator3.id,
      wsetLevel: 3,
      tags: { connect: [{ id: tagWSET.id }, { id: tagAvanzado.id }] }
    }
  })

  await prisma.course.upsert({
    where: { slug: 'pasaporte-cultura-vino' },
    update: {
      title: 'Pasaporte a la Cultura del Vino',
      description: 'El mundo del vino es amplio, pero hay un punto de partida. Si querés entender mejor los estilos de vinos, las principales variedades de uva y cómo disfrutar cada copa, este taller es para vos.',
      startDate: new Date('2026-04-23'),
      endDate: new Date('2026-04-23'),
      duration: '1 hora',
      maxCapacity: 100,
      priceUSD: 0,
      imageUrl: 'https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=800&h=600&fit=crop',
      status: 'enrolling',
      tags: { set: [{ id: tagPrincipiante.id }, { id: tagCata.id }] }
    },
    create: {
      slug: 'pasaporte-cultura-vino',
      title: 'Pasaporte a la Cultura del Vino',
      type: 'taller',
      modality: 'online',
      description: 'El mundo del vino es amplio, pero hay un punto de partida. Si querés entender mejor los estilos de vinos, las principales variedades de uva y cómo disfrutar cada copa, este taller es para vos.',
      startDate: new Date('2026-04-23'),
      endDate: new Date('2026-04-23'),
      duration: '1 hora',
      maxCapacity: 100,
      enrolledCount: 0,
      priceUSD: 0,
      imageUrl: 'https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=800&h=600&fit=crop',
      status: 'enrolling',
      educatorId: educator2.id,
      tags: { connect: [{ id: tagPrincipiante.id }, { id: tagCata.id }] }
    }
  })

  console.log('✅ Created courses')

  // ============================================
  // ONLINE COURSE: Modules & Lessons
  // ============================================

  // Get the online course to add modules
  const onlineCourse = await prisma.course.findUnique({
    where: { slug: 'introduccion-vinos-chilenos' },
  })

  if (onlineCourse) {
    // Clean up existing modules (for re-seeding)
    await prisma.courseModule.deleteMany({
      where: { courseId: onlineCourse.id },
    })

    // Module 1: Introducción al Vino Chileno
    const mod1 = await prisma.courseModule.create({
      data: {
        courseId: onlineCourse.id,
        title: 'Introducción al Vino Chileno',
        order: 0,
      },
    })

    await prisma.lesson.createMany({
      data: [
        {
          moduleId: mod1.id,
          title: 'Historia vitivinícola de Chile',
          slug: 'historia-vitivinicola-chile',
          summary: '## Acerca de este video\n\nUn recorrido por los orígenes y la evolución de la industria vitivinícola chilena, desde las primeras cepas traídas por los conquistadores españoles hasta el boom exportador del siglo XXI.\n\n## Qué aprenderás\n\n- Los orígenes coloniales de la viticultura en Chile\n- La influencia francesa en el desarrollo de la industria\n- El resurgimiento del vino chileno en los años 80 y 90\n- Chile como potencia exportadora mundial',
          order: 0,
          videoDuration: 720,
          videoStatus: 'pending',
          isFree: true,
        },
        {
          moduleId: mod1.id,
          title: 'Regiones y valles principales',
          slug: 'regiones-valles-principales',
          summary: '## Acerca de este video\n\nExplora la geografía vitivinícola de Chile, desde el desierto de Atacama hasta la Patagonia. Conoce los valles más importantes y sus características únicas.\n\n## Qué aprenderás\n\n- La clasificación de regiones vitivinícolas chilenas\n- Características del Valle Central, Valle de Casablanca y Valle del Maule\n- Cómo la geografía influye en los estilos de vino\n- Valles emergentes y tendencias actuales',
          order: 1,
          videoDuration: 900,
          videoStatus: 'pending',
          isFree: false,
        },
        {
          moduleId: mod1.id,
          title: 'Variedades emblema: Carmenère y más',
          slug: 'variedades-emblema-carmenere',
          summary: '## Acerca de este video\n\nDescubre las variedades de uva que definen la identidad del vino chileno, con especial foco en el Carmenère, la cepa insignia de Chile.\n\n## Qué aprenderás\n\n- La historia del Carmenère y su redescubrimiento en Chile\n- Cabernet Sauvignon, Sauvignon Blanc y País\n- Perfiles aromáticos y de sabor de cada variedad\n- Maridajes recomendados para cada cepa',
          order: 2,
          videoDuration: 1080,
          videoStatus: 'pending',
          isFree: false,
        },
      ],
    })

    // Module 2: Terroir y Viticultura
    const mod2 = await prisma.courseModule.create({
      data: {
        courseId: onlineCourse.id,
        title: 'Terroir y Viticultura',
        order: 1,
      },
    })

    await prisma.lesson.createMany({
      data: [
        {
          moduleId: mod2.id,
          title: 'Clima, suelo y geografía',
          slug: 'clima-suelo-geografia',
          summary: '## Acerca de este video\n\nEntiende cómo los factores climáticos y geológicos de Chile crean condiciones ideales para la viticultura. Desde la Corriente de Humboldt hasta los suelos aluviales.\n\n## Qué aprenderás\n\n- El concepto de terroir aplicado a Chile\n- Influencia del Océano Pacífico y la Cordillera de los Andes\n- Tipos de suelo y su impacto en el vino\n- Microclimas y sus efectos en las variedades',
          order: 0,
          videoDuration: 840,
          videoStatus: 'pending',
          isFree: false,
        },
        {
          moduleId: mod2.id,
          title: 'Prácticas de viticultura',
          slug: 'practicas-viticultura',
          summary: '## Acerca de este video\n\nConoce las técnicas de cultivo utilizadas en los viñedos chilenos, desde la conducción de la vid hasta el manejo sustentable.\n\n## Qué aprenderás\n\n- Sistemas de conducción más usados en Chile\n- Riego y manejo del canopy\n- Viticultura orgánica y biodinámica en Chile\n- Control de plagas y enfermedades',
          order: 1,
          videoDuration: 660,
          videoStatus: 'pending',
          isFree: false,
        },
        {
          moduleId: mod2.id,
          title: 'Vendimia y estacionalidad',
          slug: 'vendimia-estacionalidad',
          summary: '## Acerca de este video\n\nAcompaña el proceso de vendimia en un viñedo chileno. Aprende sobre la importancia del momento de cosecha y los factores que lo determinan.\n\n## Qué aprenderás\n\n- Cómo se determina el momento óptimo de cosecha\n- Vendimia manual vs. mecánica\n- El calendario vitivinícola del hemisferio sur\n- De la viña a la bodega: el recorrido de la uva',
          order: 2,
          videoDuration: 1200,
          videoStatus: 'pending',
          isFree: false,
        },
      ],
    })

    // Module 3: Cata de Vinos Chilenos
    const mod3 = await prisma.courseModule.create({
      data: {
        courseId: onlineCourse.id,
        title: 'Cata de Vinos Chilenos',
        order: 2,
      },
    })

    const mod3Lessons = await Promise.all([
      prisma.lesson.create({
        data: {
          moduleId: mod3.id,
          title: 'Técnica de cata aplicada',
          slug: 'tecnica-cata-aplicada',
          summary: '## Acerca de este video\n\nAprende la metodología profesional de cata paso a paso: vista, nariz y boca. Aplica estas técnicas a vinos chilenos representativos.\n\n## Qué aprenderás\n\n- Las tres fases de la cata profesional\n- Vocabulario técnico de cata\n- Cómo identificar defectos en el vino\n- Ejercicios prácticos para desarrollar tu paladar',
          order: 0,
          videoDuration: 960,
          videoStatus: 'pending',
          isFree: false,
        },
      }),
      prisma.lesson.create({
        data: {
          moduleId: mod3.id,
          title: 'Cata guiada: 6 vinos representativos',
          slug: 'cata-guiada-6-vinos',
          summary: '## Acerca de este video\n\nUna cata guiada virtual de 6 vinos chilenos seleccionados que representan la diversidad y calidad del país. Incluye notas de cata detalladas.\n\n## Qué aprenderás\n\n- Catar un Sauvignon Blanc de Casablanca\n- Catar un Carmenère del Valle de Rapel\n- Catar un Cabernet Sauvignon del Maipo\n- Comparar estilos y regiones en copa',
          order: 1,
          videoDuration: 1320,
          videoStatus: 'pending',
          isFree: false,
        },
      }),
    ])

    // Add sample materials to a lesson
    await prisma.lessonMaterial.createMany({
      data: [
        {
          lessonId: mod3Lessons[0].id,
          name: 'Guía de Aromas del Vino (PDF)',
          url: 'https://example.com/guia-aromas-vino.pdf',
          type: 'document',
          order: 0,
        },
        {
          lessonId: mod3Lessons[1].id,
          name: 'Fichas de Cata - 6 Vinos',
          url: 'https://example.com/fichas-cata.pdf',
          type: 'document',
          order: 0,
        },
        {
          lessonId: mod3Lessons[1].id,
          name: 'Mapa de Regiones Vitivinícolas',
          url: 'https://example.com/mapa-regiones.jpg',
          type: 'image',
          order: 1,
        },
      ],
    })

    // Module 4: Maridaje y Cultura
    const mod4 = await prisma.courseModule.create({
      data: {
        courseId: onlineCourse.id,
        title: 'Maridaje y Cultura',
        order: 3,
      },
    })

    await prisma.lesson.createMany({
      data: [
        {
          moduleId: mod4.id,
          title: 'Maridaje con cocina chilena',
          slug: 'maridaje-cocina-chilena',
          summary: '## Acerca de este video\n\nExplora las combinaciones perfectas entre vinos chilenos y la gastronomía local. Desde empanadas hasta curanto, descubre el maridaje ideal.\n\n## Qué aprenderás\n\n- Principios básicos del maridaje\n- Maridajes clásicos de la cocina chilena\n- Cómo el Carmenère complementa los sabores locales\n- Maridajes creativos y contemporáneos',
          order: 0,
          videoDuration: 780,
          videoStatus: 'pending',
          isFree: false,
        },
        {
          moduleId: mod4.id,
          title: 'Enoturismo y tendencias',
          slug: 'enoturismo-tendencias',
          summary: '## Acerca de este video\n\nDescubre las rutas del vino en Chile y las tendencias que están dando forma al futuro de la industria vitivinícola chilena.\n\n## Qué aprenderás\n\n- Las principales rutas del vino en Chile\n- Tendencias en vinificación: vinos naturales, naranjos y de autor\n- El movimiento de vinos de pequeñas bodegas\n- Cómo planificar tu viaje enoturístico por Chile',
          order: 1,
          videoDuration: 900,
          videoStatus: 'pending',
          isFree: false,
        },
      ],
    })

    console.log('✅ Created online course modules and lessons')
  }

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
