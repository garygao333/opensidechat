//this is used to define the api routes for the posts

import { NextRequest, NextResponse } from 'next/server'

//this is used to handle the get request for the posts

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Posts API endpoint' })
}

//this is used to handle the post request for the posts

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Post created' })
}