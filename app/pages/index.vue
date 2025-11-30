<template>
  <div class="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
    <UContainer>
      <div class="max-w-4xl mx-auto">
        <!-- hero section -->
        <div class="flex flex-col items-center text-center space-y-8">
          <!-- profile picture -->
          <div class="relative">
            <NuxtImg
              src="/8bit_hero.webp"
              alt="Profile picture"
              width="128"
              height="128"
              class="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
            />
          </div>

          <!-- main heading -->
          <div class="space-y-2">
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Hi, I'm Kevia
            </h1>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Father, Husband, Software Engineer
            </h2>
          </div>

          <!-- descriptive paragraph -->
          <p class="text-lg md:text-xl text-gray-700 max-w-2xl leading-relaxed">
            Trying to build tools that solve real problems for real people. Neighborhood coordination platforms. Healthcare calculators. Tackling systemic challenges head-on, one tool at a time!
          </p>
        </div>
      </div>
    </UContainer>

    <!-- manifesto section -->
    <div class="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 py-16 md:py-24 mt-24 md:mt-32">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col space-y-12 max-w-3xl">
            <!-- statement -->
            <p class="text-2xl md:text-3xl text-gray-900 leading-relaxed font-bold text-left">
              We have the tools to solve our biggest problems. We just need to ask better questions:
            </p>

            <!-- questions -->
            <div class="space-y-8">
              <div class="flex items-start gap-4">
                <span class="text-2xl mt-1">💰</span>
                <p class="text-lg md:text-xl text-gray-900 font-semibold text-left flex-1">
                  Why is healthcare bankrupting families in the richest country in the world?
                </p>
              </div>
              <div class="flex items-start gap-4">
                <span class="text-2xl mt-1">📚</span>
                <p class="text-lg md:text-xl text-gray-900 font-semibold text-left flex-1">
                  Why are we teaching kids with methods from decades ago?
                </p>
              </div>
              <div class="flex items-start gap-4">
                <span class="text-2xl mt-1">🏘️</span>
                <p class="text-lg md:text-xl text-gray-900 font-semibold text-left flex-1">
                  Why do neighbors live as strangers?
                </p>
              </div>
              <div class="flex items-start gap-4">
                <span class="text-2xl mt-1">⚙️</span>
                <p class="text-lg md:text-xl text-gray-900 font-semibold text-left flex-1">
                  Why are systems designed to extract rather than serve?
                </p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- projects section -->
    <div class="w-full bg-white py-16 md:py-24">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 text-left mb-8">
            Projects
          </h2>
          
          <!-- project links -->
          <ul class="space-y-4">
            <li>
              <ULink
                href="https://aca-subsidy-calculator.cloud-546.workers.dev/"
                target="_blank"
                external
                class="flex items-center gap-3 text-lg md:text-xl text-gray-900 hover:text-gray-900 transition-colors group"
              >
                <span class="text-gray-600 group-hover:text-gray-900">→</span>
                <span class="border-b-2 border-transparent group-hover:border-green-500 transition-colors">
                  ACA Subsidy Calculator
                </span>
              </ULink>
            </li>
          </ul>
        </div>
      </UContainer>
    </div>

    <!-- contact section -->
    <div class="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 py-16 md:py-24">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 text-left mb-6">
            Contact
          </h2>
          <p class="text-lg md:text-xl text-gray-700 text-left max-w-2xl mb-8">
            If these questions and problems interest you, let's connect!
          </p>
          
          <!-- social links -->
          <div class="flex flex-row gap-6">
            <ULink
              href="https://bsky.app/profile/kevia.me"
              target="_blank"
              external
              class="flex items-center gap-2 text-lg md:text-xl text-gray-900 hover:text-gray-900 transition-colors group"
            >
              <UIcon name="i-simple-icons-bluesky" class="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <span class="border-b-2 border-transparent group-hover:border-green-500 transition-colors">
                Bluesky
              </span>
            </ULink>
            <ULink
              href="https://www.linkedin.com/in/kevia-cloud/"
              target="_blank"
              external
              class="flex items-center gap-2 text-lg md:text-xl text-gray-900 hover:text-gray-900 transition-colors group"
            >
              <UIcon name="i-simple-icons-linkedin" class="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <span class="border-b-2 border-transparent group-hover:border-green-500 transition-colors">
                LinkedIn
              </span>
            </ULink>
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
// page logic here
</script>
