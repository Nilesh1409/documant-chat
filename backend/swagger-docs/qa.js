/**
 * @swagger
 * tags:
 *   name: Q&A
 *   description: Question and answer endpoints with RAG
 */

/**
 * @swagger
 * /api/qa/ask:
 *   post:
 *     summary: Ask a question about your documents
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question to ask
 *     responses:
 *       200:
 *         description: Question answered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: The original question
 *                     answer:
 *                       type: string
 *                       description: The generated answer
 *                     confidence:
 *                       type: string
 *                       enum: [high, medium, low, none]
 *                       description: Confidence level of the answer
 *                     sources:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           documentId:
 *                             type: string
 *                             description: ID of the source document
 *                           title:
 *                             type: string
 *                             description: Title of the source document
 *                           excerpts:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Relevant excerpts from the document
 *                           metadata:
 *                             type: object
 *                             properties:
 *                               author:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                               tags:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/qa/history:
 *   get:
 *     summary: Get Q&A history
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Q&A history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           question:
 *                             type: string
 *                           answer:
 *                             type: string
 *                           confidence:
 *                             type: string
 *                             enum: [high, medium, low, none]
 *                           sources:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 documentId:
 *                                   type: string
 *                                 title:
 *                                   type: string
 *                                 excerpts:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 2
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Clear all Q&A history
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: History cleared successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/qa/history/{id}:
 *   delete:
 *     summary: Delete a specific Q&A history item
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: History item ID
 *     responses:
 *       200:
 *         description: History item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: History item deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: History item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/qa/index/{documentId}:
 *   post:
 *     summary: Index a document for RAG
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document indexed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document indexed successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
