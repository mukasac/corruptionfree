import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Create a test department
    const department = await prisma.department.create({
      data: {
        name: "Test Department",
      }
    })
    
    // Create a test impact area
    const impactArea = await prisma.impactArea.create({
      data: {
        name: "Test Impact Area",
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: { department, impactArea }
    })
  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}