import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import pg from 'pg'

config({ path: '.env.local' })

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/** Helper to build TipTap-compatible HTML for lesson summaries */
function summary(about: string, items: string[]): string {
  const listItems = items.map((i) => `<li><p>${i}</p></li>`).join('')
  return `<h2>Acerca de este video</h2><p>${about}</p><h2>Qué aprenderás</h2><ul>${listItems}</ul>`
}

async function main() {
  // Find Gabi Zimmer educator
  const gabi = await prisma.educator.findFirst({ where: { name: { contains: 'Gabi' } } })
  if (!gabi) {
    console.log('❌ Educator Gabi Zimmer not found')
    return
  }

  // Upsert the online e-learning course
  const onlineCourse = await prisma.course.upsert({
    where: { slug: 'introduccion-vinos-online' },
    update: {},
    create: {
      slug: 'introduccion-vinos-online',
      title: 'Introducción al Mundo del Vino',
      type: 'curso',
      modality: 'online',
      description: 'Un curso completo para iniciarte en el fascinante mundo del vino. Desde la viña hasta tu copa, aprende sobre variedades, regiones, técnicas de cata y maridaje con videos grabados que puedes ver a tu ritmo.',
      priceUSD: 65,
      priceUYU: 2900,
      imageUrl: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800&h=600&fit=crop',
      status: 'draft',
      educatorId: gabi.id,
    },
  })

  console.log(`📝 Course: ${onlineCourse.title} (${onlineCourse.slug})`)

  // Clean up existing modules (for re-seeding)
  await prisma.courseModule.deleteMany({ where: { courseId: onlineCourse.id } })

  // Module 1: Introducción al Vino Chileno
  const mod1 = await prisma.courseModule.create({
    data: { courseId: onlineCourse.id, title: 'Introducción al Vino Chileno', order: 0 },
  })
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: mod1.id,
        title: 'Historia vitivinícola de Chile',
        slug: 'historia-vitivinicola-chile',
        summary: summary(
          'Un recorrido por los orígenes y la evolución de la industria vitivinícola chilena, desde las primeras cepas traídas por los conquistadores españoles hasta el boom exportador del siglo XXI.',
          [
            'Los orígenes coloniales de la viticultura en Chile',
            'La influencia francesa en el desarrollo de la industria',
            'El resurgimiento del vino chileno en los años 80 y 90',
            'Chile como potencia exportadora mundial',
          ]
        ),
        order: 0,
        videoStatus: 'pending',
        isFree: true,
      },
      {
        moduleId: mod1.id,
        title: 'Regiones y valles principales',
        slug: 'regiones-valles-principales',
        summary: summary(
          'Explora la geografía vitivinícola de Chile, desde el desierto de Atacama hasta la Patagonia. Conoce los valles más importantes y sus características únicas.',
          [
            'La clasificación de regiones vitivinícolas chilenas',
            'Características del Valle Central, Valle de Casablanca y Valle del Maule',
            'Cómo la geografía influye en los estilos de vino',
            'Valles emergentes y tendencias actuales',
          ]
        ),
        order: 1,
        videoStatus: 'pending',
        isFree: false,
      },
      {
        moduleId: mod1.id,
        title: 'Variedades emblema: Carmenère y más',
        slug: 'variedades-emblema-carmenere',
        summary: summary(
          'Descubre las variedades de uva que definen la identidad del vino chileno, con especial foco en el Carmenère, la cepa insignia de Chile.',
          [
            'La historia del Carmenère y su redescubrimiento en Chile',
            'Cabernet Sauvignon, Sauvignon Blanc y País',
            'Perfiles aromáticos y de sabor de cada variedad',
            'Maridajes recomendados para cada cepa',
          ]
        ),
        order: 2,
        videoStatus: 'pending',
        isFree: false,
      },
    ],
  })

  // Module 2: Terroir y Viticultura
  const mod2 = await prisma.courseModule.create({
    data: { courseId: onlineCourse.id, title: 'Terroir y Viticultura', order: 1 },
  })
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: mod2.id,
        title: 'Clima, suelo y geografía',
        slug: 'clima-suelo-geografia',
        summary: summary(
          'Entiende cómo los factores climáticos y geológicos de Chile crean condiciones ideales para la viticultura. Desde la Corriente de Humboldt hasta los suelos aluviales.',
          [
            'El concepto de terroir aplicado a Chile',
            'Influencia del Océano Pacífico y la Cordillera de los Andes',
            'Tipos de suelo y su impacto en el vino',
            'Microclimas y sus efectos en las variedades',
          ]
        ),
        order: 0,
        videoStatus: 'pending',
        isFree: false,
      },
      {
        moduleId: mod2.id,
        title: 'Prácticas de viticultura',
        slug: 'practicas-viticultura',
        summary: summary(
          'Conoce las técnicas de cultivo utilizadas en los viñedos chilenos, desde la conducción de la vid hasta el manejo sustentable.',
          [
            'Sistemas de conducción más usados en Chile',
            'Riego y manejo del canopy',
            'Viticultura orgánica y biodinámica en Chile',
            'Control de plagas y enfermedades',
          ]
        ),
        order: 1,
        videoStatus: 'pending',
        isFree: false,
      },
      {
        moduleId: mod2.id,
        title: 'Vendimia y estacionalidad',
        slug: 'vendimia-estacionalidad',
        summary: summary(
          'Acompaña el proceso de vendimia en un viñedo chileno. Aprende sobre la importancia del momento de cosecha y los factores que lo determinan.',
          [
            'Cómo se determina el momento óptimo de cosecha',
            'Vendimia manual vs. mecánica',
            'El calendario vitivinícola del hemisferio sur',
            'De la viña a la bodega: el recorrido de la uva',
          ]
        ),
        order: 2,
        videoStatus: 'pending',
        isFree: false,
      },
    ],
  })

  // Module 3: Cata de Vinos Chilenos
  const mod3 = await prisma.courseModule.create({
    data: { courseId: onlineCourse.id, title: 'Cata de Vinos Chilenos', order: 2 },
  })
  const lesson1 = await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: 'Técnica de cata aplicada',
      slug: 'tecnica-cata-aplicada',
      summary: summary(
        'Aprende la metodología profesional de cata paso a paso: vista, nariz y boca. Aplica estas técnicas a vinos chilenos representativos.',
        [
          'Las tres fases de la cata profesional',
          'Vocabulario técnico de cata',
          'Cómo identificar defectos en el vino',
          'Ejercicios prácticos para desarrollar tu paladar',
        ]
      ),
      order: 0,
      videoStatus: 'pending',
      isFree: false,
    },
  })
  const lesson2 = await prisma.lesson.create({
    data: {
      moduleId: mod3.id,
      title: 'Cata guiada: 6 vinos representativos',
      slug: 'cata-guiada-6-vinos',
      summary: summary(
        'Una cata guiada virtual de 6 vinos chilenos seleccionados que representan la diversidad y calidad del país. Incluye notas de cata detalladas.',
        [
          'Catar un Sauvignon Blanc de Casablanca',
          'Catar un Carmenère del Valle de Rapel',
          'Catar un Cabernet Sauvignon del Maipo',
          'Comparar estilos y regiones en copa',
        ]
      ),
      order: 1,
      videoStatus: 'pending',
      isFree: false,
    },
  })

  // Sample materials
  await prisma.lessonMaterial.createMany({
    data: [
      { lessonId: lesson1.id, name: 'Guía de Aromas del Vino (PDF)', url: 'https://example.com/guia-aromas-vino.pdf', type: 'document', order: 0 },
      { lessonId: lesson2.id, name: 'Fichas de Cata - 6 Vinos', url: 'https://example.com/fichas-cata.pdf', type: 'document', order: 0 },
      { lessonId: lesson2.id, name: 'Mapa de Regiones Vitivinícolas', url: 'https://example.com/mapa-regiones.jpg', type: 'image', order: 1 },
    ],
  })

  // Module 4: Maridaje y Cultura
  const mod4 = await prisma.courseModule.create({
    data: { courseId: onlineCourse.id, title: 'Maridaje y Cultura', order: 3 },
  })
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: mod4.id,
        title: 'Maridaje con cocina chilena',
        slug: 'maridaje-cocina-chilena',
        summary: summary(
          'Explora las combinaciones perfectas entre vinos chilenos y la gastronomía local. Desde empanadas hasta curanto, descubre el maridaje ideal.',
          [
            'Principios básicos del maridaje',
            'Maridajes clásicos de la cocina chilena',
            'Cómo el Carmenère complementa los sabores locales',
            'Maridajes creativos y contemporáneos',
          ]
        ),
        order: 0,
        videoStatus: 'pending',
        isFree: false,
      },
      {
        moduleId: mod4.id,
        title: 'Enoturismo y tendencias',
        slug: 'enoturismo-tendencias',
        summary: summary(
          'Descubre las rutas del vino en Chile y las tendencias que están dando forma al futuro de la industria vitivinícola chilena.',
          [
            'Las principales rutas del vino en Chile',
            'Tendencias en vinificación: vinos naturales, naranjos y de autor',
            'El movimiento de vinos de pequeñas bodegas',
            'Cómo planificar tu viaje enoturístico por Chile',
          ]
        ),
        order: 1,
        videoStatus: 'pending',
        isFree: false,
      },
    ],
  })

  // Enroll test student rapha.uy@gmail.com
  const testUser = await prisma.user.findUnique({ where: { email: 'rapha.uy@gmail.com' } })
  if (testUser) {
    let student = await prisma.student.findUnique({ where: { userId: testUser.id } })
    if (!student) {
      student = await prisma.student.create({
        data: { userId: testUser.id, firstName: testUser.name || 'Raphael', lastName: '' },
      })
      console.log(`👤 Created student for ${testUser.email}`)
    }
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: onlineCourse.id } },
      update: {},
      create: { studentId: student.id, courseId: onlineCourse.id, status: 'confirmed' },
    })
    console.log(`🎓 Enrolled ${testUser.email} in ${onlineCourse.title}`)
  } else {
    console.log('⚠️ Test user rapha.uy@gmail.com not found, skipping enrollment')
  }

  console.log('✅ Online course seeded: 4 modules, 10 lessons, 3 materials')
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
