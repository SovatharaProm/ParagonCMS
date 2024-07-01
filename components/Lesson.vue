<template>
    <div
    class="relative w-full p-6 shadow-lg border-0 rounded-lg overflow-hidden flex justify-between items-center bg-white mb-4"
    draggable="true"
    @dragstart="dragStart"
    @dragover.prevent
    @drop="drop"
    >
    <div class="flex items-center space-x-4">
        <div
        class="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center cursor-move"
        >
        <Icon name="mi:drag" class="text-2xl text-gray-500" />
        </div>
        <div class="w-3 h-full bg-blue-900"></div>
        <div>
        <p class="text-lg font-medium">{{ courseTitle }}</p>
        </div>
    </div>
    <div class="flex items-center space-x-2">
        <NuxtLink
        :to="`/instructor/EditLesson`"
        class="ml-2 px-2 py-1 rounded bg-blue-900 text-white flex items-center hover:bg-blue-700 transition-all duration-200 ease-in-out"
        title="Edit Course"
        >
        <Icon name="tabler:edit" class="text-xl" />
        </NuxtLink>
        <button
        @click="deleteCourse"
        class="ml-2 px-2 py-1 rounded bg-orange-600 text-white flex items-center hover:bg-orange-400 transition-all duration-200 ease-in-out"
        title="Delete Course"
        >
        <Icon name="material-symbols:delete-outline" class="text-xl" />
        </button>
    </div>
    </div>
</template>

<script>
export default {
props: {
    lessonId: {
    type: Number,
    required: true,
    },
    courseTitle: {
    type: String,
    default: "Lesson",
    },
    lessonDuration: {
    type: String,
    default: "0m 0s",
    },
    spacing: {
    type: String,
    default: "1rem",
    },
},
data() {
    return {
    courseStatus: "Draft",
    };
},
methods: {
    updateCourseStatus() {
    console.log(`Status updated to: ${this.courseStatus}`);
    },
    deleteCourse() {
    console.log(`Deleting lesson with ID ${this.lessonId}`);
    },
    dragStart(event) {
    event.dataTransfer.setData("text/plain", this.lessonId);
    },
    drop(event) {
    const droppedLessonId = event.dataTransfer.getData("text/plain");
    this.$emit("lesson-dropped", {
        from: droppedLessonId,
        to: this.lessonId,
    });
    },
},
};
</script>
